package infrastructure.db

import com.mongodb.client.{MongoClient, MongoClients, MongoCollection, MongoDatabase}
import com.mongodb.client.model.{Filters, ReplaceOptions, Sorts}
import domain.events.EventCompleted
import domain.models.{Event, EventStatus, Location}
import domain.models.EventConversions.{fromDocument, toDocument}
import infrastructure.messaging.EventPublisher
import org.bson.Document
import utils.Utils

import scala.collection.mutable.ListBuffer
import scala.jdk.CollectionConverters.*
import scala.util.{Failure, Success, Try}

trait EventRepository:

  def save(event: Event): Either[Throwable, Unit]
  def findById(eventId: String): Option[Event]
  def update(event: Event): Either[Throwable, Unit]
  def findAllPublished(): Either[Throwable, List[Event]]
  def delete(eventId: String): Either[Throwable, Unit]
  def findByFilters(
      limit: Option[Int] = None,
      offset: Option[Int] = None,
      status: Option[List[EventStatus]] = None,
      title: Option[String] = None,
      tags: Option[List[String]] = None,
      startDate: Option[String] = None,
      endDate: Option[String] = None,
      organizationId: Option[String] = None,
      city: Option[String] = None,
      location_name: Option[String] = None,
      sortBy: Option[String] = None,
      sortOrder: Option[String] = None,
      query: Option[String] = None,
      near: Option[(Double, Double)] = None,
      other: Option[String] = None,
      price: Option[(Double, Double)] = None
  ): Either[Throwable, (List[Event], Boolean)]

case class MongoEventRepository(
    connectionString: String,
    databaseName: String,
    collectionName: String = "events",
    messageBroker: EventPublisher,
    priceRepository: Option[PriceRepository] = None
) extends EventRepository:

  private val mongoClient: MongoClient              = MongoClients.create(connectionString)
  private val database: MongoDatabase               = mongoClient.getDatabase(databaseName)
  private val collection: MongoCollection[Document] = database.getCollection(collectionName)

  override def save(event: Event): Either[Throwable, Unit] =
    val replaceOptions = new ReplaceOptions().upsert(true)

    Try {
      collection.replaceOne(Filters.eq("_id", event._id), event.toDocument, replaceOptions)
      println(s"[MongoDB] Saved Event ID: ${event._id} with status: ${event.status}")
    } match
      case Success(_) => Right(())
      case Failure(ex) =>
        println(s"[MongoDB][Error] Failed to save Event ID: ${event._id} - ${ex.getMessage}")
        Left(ex)

  override def findById(eventId: String): Option[Event] =
    val doc = collection.find(Filters.eq("_id", eventId)).first()
    if doc != null then
      val event        = fromDocument(doc)
      val updatedEvent = Utils.updateEventIfPastDate(event)
      if updatedEvent.status != event.status then
        update(updatedEvent).left.foreach(ex =>
          println(s"[MongoDB] Could not auto-update past event to COMPLETED: ${ex.getMessage}")
        )
        publishEventCompletedIfNeeded(updatedEvent, event)
      Some(updatedEvent)
    else None

  override def update(event: Event): Either[Throwable, Unit] =
    Try {
      val replaceOptions = new ReplaceOptions().upsert(false)
      collection.replaceOne(Filters.eq("_id", event._id), event.toDocument, replaceOptions)
    } match
      case Success(_) => Right(())
      case Failure(ex) =>
        println(s"[MongoDB][Error] Failed to update Event ID: ${event._id} - ${ex.getMessage}")
        Left(ex)

  override def findAllPublished(): Either[Throwable, List[Event]] =
    Try {
      collection
        .find(Filters.eq("status", EventStatus.PUBLISHED.toString))
        .sort(Sorts.ascending("date"))
        .into(new java.util.ArrayList[Document]())
        .asScala
        .map(fromDocument)
        .map { event =>
          val updatedEvent = Utils.updateEventIfPastDate(event)
          if updatedEvent.status != event.status then
            update(updatedEvent).left.foreach(ex =>
              println(s"[MongoDB] Could not auto-update past event to COMPLETED: ${ex.getMessage}")
            )
          publishEventCompletedIfNeeded(updatedEvent, event)
          updatedEvent
        }
        .toList
    }.toEither.left.map { ex =>
      println(s"[MongoDB][Error] Failed to retrieve published events - ${ex.getMessage}")
      ex
    }

  override def delete(eventId: String): Either[Throwable, Unit] =
    Try {
      collection.deleteOne(Filters.eq("_id", eventId))
      println(s"[MongoDB] Deleted Event ID: $eventId")
    } match
      case Success(_) => Right(())
      case Failure(ex) =>
        println(s"[MongoDB][Error] Failed to delete Event ID: $eventId -" + s" ${ex.getMessage}")
        Left(ex)

  override def findByFilters(
      limit: Option[Int] = None,
      offset: Option[Int] = None,
      status: Option[List[EventStatus]] = None,
      title: Option[String] = None,
      tags: Option[List[String]] = None,
      startDate: Option[String] = None,
      endDate: Option[String] = None,
      organizationId: Option[String] = None,
      city: Option[String] = None,
      location_name: Option[String] = None,
      sortBy: Option[String] = None,
      sortOrder: Option[String] = None,
      query: Option[String] = None,
      near: Option[(Double, Double)] = None,
      other: Option[String] = None,
      price: Option[(Double, Double)] = None
  ): Either[Throwable, (List[Event], Boolean)] =
    Try {
      val isFeedMode    = other.exists(_.toLowerCase == "feed")
      val tagsForFilter = if isFeedMode then None else tags

      val combinedFilter =
        buildFilterQuery(
          limit = limit.getOrElse(20),
          status,
          title,
          tagsForFilter,
          startDate,
          endDate,
          organizationId,
          city,
          location_name,
          query,
          price
        )

      (other, near) match
        case (Some(otherSort), _) =>
          handleOtherSort(otherSort, combinedFilter, offset, limit, sortBy, sortOrder, tags)

        case (None, Some((lat, lon))) =>
          handleNearSort(lat, lon, combinedFilter, offset, limit, sortBy, sortOrder)

        case (None, None) =>
          val sortField = sortBy.getOrElse("date")

          if sortField == "price" && priceRepository.isDefined then
            handlePriceSort(combinedFilter, offset, limit, sortOrder)
          else
            val sortDirection = if sortOrder.contains("desc") then -1 else 1

            val sortCriteria = if sortField == "date" then
              Sorts.orderBy(
                if sortDirection == 1 then Sorts.ascending("date") else Sorts.descending("date")
              )
            else
              Sorts.orderBy(
                if sortDirection == 1 then Sorts.ascending(sortField) else Sorts.descending(sortField),
                Sorts.ascending("date")
              )

            val dbQuery = applyPagination(collection.find(combinedFilter).sort(sortCriteria), offset, limit)
            val results = executeQueryAndUpdateEvents(dbQuery)
            calculateHasMore(results, limit)
    }.toEither.left.map { ex =>
      println(s"[MongoDB][Error] Failed to retrieve filtered events - ${ex.getMessage}")
      ex
    }

  def close(): Unit =
    mongoClient.close()

  private def buildFilterQuery(
      limit: Int,
      status: Option[List[EventStatus]],
      title: Option[String],
      tags: Option[List[String]],
      startDate: Option[String],
      endDate: Option[String],
      organizationId: Option[String],
      city: Option[String],
      location_name: Option[String],
      query: Option[String],
      price: Option[(Double, Double)]
  ): org.bson.conversions.Bson =
    val filters = scala.collection.mutable.ListBuffer.empty[org.bson.conversions.Bson]

    status.foreach { statusList =>
      if statusList.nonEmpty then
        if statusList.size == 1 then
          filters += Filters.eq("status", statusList.head.toString)
        else
          filters += Filters.in("status", statusList.map(_.toString).asJava)
    }
    title.foreach(t => filters += Filters.regex("title", escapeRegex(t), "i"))
    query.foreach { q =>
      filters += Filters.or(
        Filters.regex("title", escapeRegex(q), "i"),
        Filters.regex("location.name", escapeRegex(q), "i"),
        Filters.regex("location.city", escapeRegex(q), "i")
      )
    }
    organizationId.foreach { org =>
      filters += Filters.or(
        Filters.eq("creatorId", org),
        Filters.eq("collaboratorIds", org)
      )
    }
    city.foreach(c => filters += Filters.regex("location.city", escapeRegex(c), "i"))
    location_name.foreach(loc => filters += Filters.regex("location.name", escapeRegex(loc), "i"))

    tags.foreach { tagList =>
      if tagList.nonEmpty then
        filters += Filters.in("tags", tagList.asJava)
    }

    price.foreach { case (minPrice, maxPrice) =>
      if priceRepository.isDefined then
        val eventIdsInRange  = priceRepository.get.findEventIdsInPriceRange(limit, minPrice, maxPrice)
        val freeEventIds     = this.findAllFree(limit)
        val matchingEventIds = if minPrice == 0.0 then eventIdsInRange ++ freeEventIds else eventIdsInRange
        if matchingEventIds.nonEmpty then
          filters += Filters.in("_id", matchingEventIds.asJava)
        else
          filters += Filters.eq("_id", "no-match")
    }

    startDate.foreach(start => filters += Filters.gte("date", start))
    endDate.foreach(end => filters += Filters.lte("date", end))
    if filters.isEmpty then
      new Document()
    else if filters.size == 1 then
      filters.head
    else
      Filters.and(filters.asJava)

  private def handleOtherSort(
      otherSort: String,
      filter: org.bson.conversions.Bson,
      offset: Option[Int],
      limit: Option[Int],
      sortBy: Option[String],
      sortOrder: Option[String],
      tags: Option[List[String]]
  ): (List[Event], Boolean) =
    otherSort.toLowerCase match
      case "feed" =>
        val offsetValue = offset.getOrElse(0)
        val limitValue  = limit.getOrElse(10)
        val needed      = offsetValue + limitValue + 1

        tags match
          case Some(tagsList) if tagsList.nonEmpty =>
            val filterWithTags = Filters.and(filter, Filters.in("tags", tagsList.asJava))
            val matchingEvents = collection
              .find(filterWithTags)
              .limit(needed)
              .into(new java.util.ArrayList[Document]())
              .asScala
              .map(fromDocument)
              .map(updateEventIfPast)
              .toList

            val sortedMatching = applySortBy(matchingEvents, sortBy, sortOrder)
            if sortedMatching.size >= needed then
              val paginated = sortedMatching.drop(offsetValue).take(limitValue + 1)
              calculateHasMore(paginated, limit)
            else
              val remaining         = needed - sortedMatching.size
              val filterWithoutTags = Filters.and(filter, Filters.nin("tags", tagsList.asJava))
              val nonMatchingEvents = collection
                .find(filterWithoutTags)
                .limit(remaining)
                .into(new java.util.ArrayList[Document]())
                .asScala
                .map(fromDocument)
                .map(updateEventIfPast)
                .toList

              val sortedNonMatching = applySortBy(nonMatchingEvents, sortBy, sortOrder)
              val orderedEvents     = sortedMatching ++ sortedNonMatching
              val paginated         = orderedEvents.drop(offsetValue).take(limitValue + 1)
              calculateHasMore(paginated, limit)

          case _ =>
            val allEvents = collection
              .find(filter)
              .limit(needed)
              .into(new java.util.ArrayList[Document]())
              .asScala
              .map(fromDocument)
              .map(updateEventIfPast)
              .toList

            val sorted    = applySortBy(allEvents, sortBy, sortOrder)
            val paginated = sorted.drop(offsetValue).take(limitValue + 1)
            calculateHasMore(paginated, limit)

      case "upcoming" =>
        val now = java.time.LocalDateTime.now()
        val upcomingFilter = Filters.and(
          filter,
          Filters.gte("date", now.toString)
        )

        val sortField     = sortBy.getOrElse("date")
        val sortDirection = if sortOrder.contains("desc") then -1 else 1

        val sortCriteria = if sortField == "date" then
          Sorts.orderBy(
            if sortDirection == 1 then Sorts.ascending("date") else Sorts.descending("date")
          )
        else
          Sorts.orderBy(
            if sortDirection == 1 then Sorts.ascending(sortField) else Sorts.descending(sortField),
            Sorts.ascending("date")
          )

        val dbQuery = applyPagination(collection.find(upcomingFilter).sort(sortCriteria), offset, limit)
        val results = executeQueryAndUpdateEvents(dbQuery)
        calculateHasMore(results, limit)

      case "popular" =>
        val offsetValue      = offset.getOrElse(0)
        val limitValue       = limit.getOrElse(10)
        val maxPopularEvents = 2000

        val sampleSize = math.min(maxPopularEvents, (offsetValue + limitValue) * 10)
        val allEvents = collection
          .find(filter)
          .limit(sampleSize)
          .into(new java.util.ArrayList[Document]())
          .asScala
          .map(fromDocument)
          .map(updateEventIfPast)
          .toList

        val shuffled = scala.util.Random.shuffle(allEvents)
        val sorted   = applySortBy(shuffled, sortBy, sortOrder)

        val paginated = sorted.drop(offsetValue).take(limitValue + 1)

        calculateHasMore(paginated, limit)

      case "recently_added" =>
        val sortField     = sortBy.getOrElse("instant")
        val sortDirection = if sortOrder.contains("desc") then -1 else 1

        val sortCriteria = if sortField == "instant" then
          Sorts.descending("instant")
        else
          Sorts.orderBy(
            Sorts.descending("instant"),
            if sortDirection == 1 then Sorts.ascending(sortField) else Sorts.descending(sortField)
          )

        val dbQuery = applyPagination(collection.find(filter).sort(sortCriteria), offset, limit)
        val results = executeQueryAndUpdateEvents(dbQuery)
        calculateHasMore(results, limit)

      case _ =>
        val sortCriteria = Sorts.ascending("date")
        val dbQuery      = applyPagination(collection.find(filter).sort(sortCriteria), offset, limit)
        val results      = executeQueryAndUpdateEvents(dbQuery)
        calculateHasMore(results, limit)

  private def handleNearSort(
      lat: Double,
      lon: Double,
      filter: org.bson.conversions.Bson,
      offset: Option[Int],
      limit: Option[Int],
      sortBy: Option[String],
      sortOrder: Option[String]
  ): (List[Event], Boolean) =
    val offsetValue   = offset.getOrElse(0)
    val limitValue    = limit.getOrElse(10)
    val maxNearEvents = 2000
    val batchSize     = 200

    val results        = ListBuffer[Event]()
    var currentSkip    = 0
    var shouldContinue = true
    var totalLoaded    = 0

    while shouldContinue do
      val batch = collection
        .find(filter)
        .skip(currentSkip)
        .limit(batchSize)
        .into(new java.util.ArrayList[Document]())
        .asScala
        .map(fromDocument)
        .map(updateEventIfPast)
        .toList

      if batch.isEmpty then
        shouldContinue = false
      else
        totalLoaded += batch.size
        results ++= batch

        if results.size >= offsetValue + limitValue + 1 || batch.size < batchSize || totalLoaded >= maxNearEvents then
          shouldContinue = false
        else
          currentSkip += batchSize

    val allEvents = results.toList

    val eventsWithDistance = allEvents.map { event =>
      val distance = calculateDistance(
        lat,
        lon,
        event.location.getOrElse(Location.Nil()).lat.getOrElse(0.0),
        event.location.getOrElse(Location.Nil()).lon.getOrElse(0.0)
      )
      (event, distance)
    }

    val finalSorted = (sortBy, sortOrder) match
      case (Some(field), Some("desc")) =>
        eventsWithDistance
          .groupBy(_._2)
          .toSeq
          .sortBy(_._1)
          .flatMap { case (_, events) =>
            field.toLowerCase match
              case "date"    => events.sortBy(_._1.date.map(_.toString).getOrElse("")).reverse
              case "title"   => events.sortBy(_._1.title.getOrElse("")).reverse
              case "instant" => events.sortBy(_._1.instant.toString).reverse
              case _         => events.sortBy(_._1.date.map(_.toString).getOrElse("")).reverse
          }
          .toList

      case (Some(field), _) =>
        eventsWithDistance
          .groupBy(_._2)
          .toSeq
          .sortBy(_._1)
          .flatMap { case (_, events) =>
            field.toLowerCase match
              case "date"    => events.sortBy(_._1.date.map(_.toString).getOrElse(""))
              case "title"   => events.sortBy(_._1.title.getOrElse(""))
              case "instant" => events.sortBy(_._1.instant.toString)
              case _         => events.sortBy(_._1.date.map(_.toString).getOrElse(""))
          }
          .toList

      case (None, _) =>
        eventsWithDistance.sortBy(_._2).toList

    val sortedEvents = finalSorted.map(_._1)

    val paginated = sortedEvents.drop(offsetValue).take(limitValue + 1)

    calculateHasMore(paginated, limit)

  private def handlePriceSort(
      filter: org.bson.conversions.Bson,
      offset: Option[Int],
      limit: Option[Int],
      sortOrder: Option[String]
  ): (List[Event], Boolean) =
    val offsetValue    = offset.getOrElse(0)
    val limitValue     = limit.getOrElse(10)
    val maxPriceEvents = 2000 // Safety limit for price sorting
    val batchSize      = 200

    val results        = ListBuffer[Event]()
    var currentSkip    = 0
    var shouldContinue = true
    var totalLoaded    = 0

    while shouldContinue do
      val batch = collection
        .find(filter)
        .skip(currentSkip)
        .limit(batchSize)
        .into(new java.util.ArrayList[Document]())
        .asScala
        .map(fromDocument)
        .map(updateEventIfPast)
        .toList

      if batch.isEmpty then
        shouldContinue = false
      else
        totalLoaded += batch.size
        results ++= batch

        if results.size >= offsetValue + limitValue + 1 || batch.size < batchSize || totalLoaded >= maxPriceEvents then
          shouldContinue = false
        else
          currentSkip += batchSize

    val allEvents = results.toList
    val eventIds  = allEvents.map(_._id)
    val pricesMap = priceRepository.get.findByEventIds(eventIds)

    val eventsWithPrice = allEvents.map { event =>
      val prices   = pricesMap.getOrElse(event._id, List.empty)
      val minPrice = if prices.nonEmpty then prices.map(_.price).min else 0.0
      (event, minPrice)
    }

    val sortedEvents = sortOrder match
      case Some("desc") => eventsWithPrice.sortBy(_._2).reverse.map(_._1)
      case _            => eventsWithPrice.sortBy(_._2).map(_._1)

    val paginated = sortedEvents.drop(offsetValue).take(limitValue + 1)

    calculateHasMore(paginated, limit)

  private def escapeRegex(str: String): String =
    str.replaceAll("([\\[\\]\\(\\)\\{\\}\\*\\+\\?\\|\\^\\$\\.\\\\/])", "\\\\$1")

  private def applySortBy(events: List[Event], sortBy: Option[String], sortOrder: Option[String]): List[Event] =
    val sortField    = sortBy.getOrElse("date")
    val isDescending = sortOrder.contains("desc")

    val sorted = sortField.toLowerCase match
      case "date" =>
        events.sortBy(_.date.map(_.toString).getOrElse(""))
      case "title" =>
        events.sortBy(_.title.getOrElse(""))
      case "instant" =>
        events.sortBy(_.instant.toString)
      case _ =>
        events.sortBy(_.date.map(_.toString).getOrElse(""))

    if isDescending then sorted.reverse else sorted

  private def applyPagination(
      query: com.mongodb.client.FindIterable[Document],
      offset: Option[Int],
      limit: Option[Int]
  ): com.mongodb.client.FindIterable[Document] =
    var paginatedQuery = query
    offset.foreach(o => paginatedQuery = paginatedQuery.skip(o))
    limit.map(_ + 1).foreach(l => paginatedQuery = paginatedQuery.limit(l))
    paginatedQuery

  private def executeQueryAndUpdateEvents(
      query: com.mongodb.client.FindIterable[Document]
  ): List[Event] =
    query
      .into(new java.util.ArrayList[Document]())
      .asScala
      .map(fromDocument)
      .map(updateEventIfPast)
      .toList

  private def updateEventIfPast(event: Event): Event =
    val updatedEvent = Utils.updateEventIfPastDate(event)
    if updatedEvent.status != event.status then
      update(updatedEvent).left.foreach(ex =>
        println(s"[MongoDB] Could not auto-update past event to COMPLETED: ${ex.getMessage}")
      )
      publishEventCompletedIfNeeded(updatedEvent, event)
    updatedEvent

  private def publishEventCompletedIfNeeded(updatedEvent: Event, originalEvent: Event): Unit =
    if updatedEvent.status == EventStatus.COMPLETED && originalEvent.status != EventStatus.COMPLETED then
      messageBroker.publish(EventCompleted(eventId = updatedEvent._id))
      println(s"[RABBITMQ] Published EventCompleted for event: ${updatedEvent._id}")

  private def calculateHasMore(results: List[Event], limit: Option[Int]): (List[Event], Boolean) =
    limit match
      case Some(lim) if results.size > lim => (results.take(lim), true)
      case _                               => (results, false)

  private def calculateDistance(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double =
    val R    = 6371.0
    val dLat = math.toRadians(lat2 - lat1)
    val dLon = math.toRadians(lon2 - lon1)
    val a = math.sin(dLat / 2) * math.sin(dLat / 2) +
      math.cos(math.toRadians(lat1)) * math.cos(math.toRadians(lat2)) *
      math.sin(dLon / 2) * math.sin(dLon / 2)
    val c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    R * c

  private def findAllFree(limit: Int): List[String] =
    collection
      .find(Filters.eq("isFree", true))
      .limit(limit)
      .projection(new Document("_id", 1))
      .into(new java.util.ArrayList[Document]())
      .asScala
      .map(_.getString("_id"))
      .toList

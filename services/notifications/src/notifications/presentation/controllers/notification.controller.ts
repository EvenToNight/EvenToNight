export class NotificationController {
  constructor() {}
}

/*

// notification.controller.ts
export class NotificationController {
  constructor(
    // Inietti gli use case handlers dall'application layer
    private readonly getNotificationsHandler: GetNotificationsHandler,
    private readonly markAsReadHandler: MarkAsReadHandler,
    // ecc...
  ) {}

  // GET /notifications - ottiene le notifiche dell'utente
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id; // dal middleware auth
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      const query = new GetNotificationsQuery(
        userId,
        Number(page),
        Number(limit),
        Boolean(unreadOnly)
      );

      const notifications = await this.getNotificationsHandler.execute(query);

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /notifications/:id/read
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const command = new MarkAsReadCommand(id, userId);
      await this.markAsReadHandler.execute(command);

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /notifications/unread-count
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const count = await this.getUnreadCountHandler.execute(userId);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }
}

*/

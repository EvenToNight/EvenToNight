import { ObjectId } from "mongodb";
import { TicketTypeSeedInput } from "../schemas/ticket-types.schema";

export const ticketTypeSeedData: TicketTypeSeedInput[] = [
  
  // =========================
  // Begin of Summer 2026
  // =========================
  {
    event: "Begin of Summer 2026",
    type: "STANDARD",
    price: {
      amount: 35,
      currency: "USD",
      _id: new ObjectId(),
    },
    availableQuantity: 500,
    soldQuantity: 0,
  },

  // =========================
  // MIKA Live 2026
  // =========================
  {
    event: "MIKA Live 2026",
    type: "STANDARD",
    price: {
      amount: 35,
      currency: "USD",
      _id: new ObjectId(),
    },
    availableQuantity: 500,
    soldQuantity: 4,
  },

  // =========================
  // Golden Hour White Party
  // =========================
  {
    event: "Golden Hour White Party",
    type: "STANDARD",
    price: {
      amount: 15,
      currency: "USD",
      _id: new ObjectId(),
    },
    availableQuantity: 300,
    soldQuantity: 3,
  },

    // =========================
  // Sunset on the Beach
  // =========================
  {
    event: "Sunset on the Beach",
    type: "STANDARD",
    price: {
      amount: 15,
      currency: "USD",
      _id: new ObjectId(),
    },
    availableQuantity: 300,
    soldQuantity: 10,
  },

  // =========================
  // Indie Night Live
  // =========================
  {
    event: "Indie Night Live",
    type: "STANDARD",
    price: {
      amount: 15,
      currency: "USD",
      _id: new ObjectId(),
    },
    availableQuantity: 300,
    soldQuantity: 3,
  },

  // =========================
  // Open Air Festival 2026
  // =========================
  {
    event: "Open Air Festival 2026",
    type: "STANDARD",
    price: {
      amount: 15,
      currency: "USD",
      _id: new ObjectId(),
    },
    availableQuantity: 300,
    soldQuantity: 5,
  },

  // =========================
  // Karaoke Friday Night
  // =========================
  {
    event: "Karaoke Friday Night",
    type: "STANDARD",
    price: {
      amount: 15,
      currency: "USD",
      _id: new ObjectId(),
    },
    availableQuantity: 300,
    soldQuantity: 3,
  },

  // =========================
  // Dinner & Jazz Experience
  // =========================
  {
    event: "Dinner & Jazz Experience",
    type: "STANDARD",
    price: {
      amount: 15,
      currency: "USD",
      _id: new ObjectId(),
    },
    availableQuantity: 300,
    soldQuantity: 3,
  },

  // =========================
  // Luxury Private Night
  // =========================
  {
    event: "Luxury Private Night",
    type: "VIP",
    price: {
      amount: 100,
      currency: "USD",
      _id: new ObjectId(),
    },
    availableQuantity: 100,
    soldQuantity: 2,
  },

  // =========================
  // Sunset Cesena 06/06
  // =========================
  {
    event: "Sunset Cesena 06/06",
    type: "STANDARD",
    price: {
      amount: 15,
      currency: "USD",
      _id: new ObjectId(),
    },
    availableQuantity: 300,
    soldQuantity: 0,
  },

];
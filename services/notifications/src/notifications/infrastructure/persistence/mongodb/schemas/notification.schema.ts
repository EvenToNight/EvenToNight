import mongoose, { Schema } from "mongoose";

export interface NotificationDocument {
  _id: string;
  userId: string;
  type: string;
  metadata: Record<string, any>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    _id: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "message",
        "like",
        "follow",
        "review",
        "new_event",
        "ticket_sell",
        "ticket_buy",
      ],
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    _id: false,
  },
);

NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1 });

export const NotificationModel = mongoose.model<NotificationDocument>(
  "Notification",
  NotificationSchema,
);

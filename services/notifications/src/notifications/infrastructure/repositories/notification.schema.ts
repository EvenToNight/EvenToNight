import mongoose, { Schema } from "mongoose";

export interface NotificationDocument {
  _id: string;
  userId: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<NotificationDocument>(
  "Notification",
  NotificationSchema,
);

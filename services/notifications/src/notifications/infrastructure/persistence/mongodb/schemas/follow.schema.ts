import mongoose, { Schema } from "mongoose";

export interface FollowDocument {
  _id: string;
  followerId: string;
  followedId: string;
  createdAt: Date;
}

const FollowSchema = new Schema<FollowDocument>(
  {
    followerId: {
      type: String,
      required: true,
      index: true,
    },
    followedId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Solo createdAt
  },
);

// Compound index per query efficienti
FollowSchema.index({ followerId: 1, followedId: 1 }, { unique: true });
FollowSchema.index({ followedId: 1, createdAt: -1 }); // Per follower list
FollowSchema.index({ followerId: 1, createdAt: -1 }); // Per following list

export const FollowModel = mongoose.model<FollowDocument>(
  "Follow",
  FollowSchema,
);

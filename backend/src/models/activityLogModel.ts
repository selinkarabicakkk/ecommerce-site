import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  activityType: 'view' | 'purchase' | 'cart' | 'wishlist';
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity must belong to a user'],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Activity must be related to a product'],
    },
    activityType: {
      type: String,
      enum: ['view', 'purchase', 'cart', 'wishlist'],
      required: [true, 'Activity type is required'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
activityLogSchema.index({ user: 1, product: 1, activityType: 1 });
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ product: 1, activityType: 1 });

const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

export default ActivityLog; 
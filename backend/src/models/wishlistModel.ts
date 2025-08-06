import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlistItem extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  createdAt: Date;
}

const wishlistSchema = new Schema<IWishlistItem>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Kullanıcı ve ürün kombinasyonunun benzersiz olmasını sağla
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model<IWishlistItem>('WishlistItem', wishlistSchema);
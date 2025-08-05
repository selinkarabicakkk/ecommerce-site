import mongoose, { Document, Schema } from 'mongoose';

export interface IProductVariant {
  name: string;
  options: {
    value: string;
    price: number;
    stock: number;
    sku: string;
  }[];
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: mongoose.Types.ObjectId;
  images: string[];
  specifications: Record<string, string>;
  tags: string[];
  isFeatured: boolean;
  slug: string;
  variants: IProductVariant[];
  averageRating: number;
  numReviews: number;
  stock: number;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: 'At least one product image is required',
      },
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    tags: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    variants: [
      {
        name: {
          type: String,
          required: true,
        },
        options: [
          {
            value: {
              type: String,
              required: true,
            },
            price: {
              type: Number,
              required: true,
              min: 0,
            },
            stock: {
              type: Number,
              required: true,
              min: 0,
              default: 0,
            },
            sku: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: 0,
      default: 0,
    },
    sku: {
      type: String,
      required: [true, 'Product SKU is required'],
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from name before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Virtual for URL
productSchema.virtual('url').get(function () {
  return `/products/${this.slug}`;
});

// Enable virtuals in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product; 
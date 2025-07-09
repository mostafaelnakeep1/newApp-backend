import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  company: Types.ObjectId;
  isHidden: boolean;
  isSuspended: boolean;
  type: string;
  capacity: number;
  brand: string;
  installDuration: number;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  company: { type: Schema.Types.ObjectId, ref: "User", required: true },
  image: { type: String, default: "https://yourdomain.com/default-product-image.png" },
  isSuspended: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false },
  type: { type: String, required: true },
  capacity: { type: Number, required: true },
  brand: { type: String, required: true },
  installDuration: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IProduct>("Product", ProductSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
  quantity: number;
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  size?: any;
  color?: any;
  id: string;
}

const cartSchema = new Schema({
  quantity: { type: Number, required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  size: { type: Schema.Types.Mixed },
  color: { type: Schema.Types.Mixed },
});

cartSchema.virtual('id').get(function (this: ICart) {
  return this._id;
});

cartSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc: any, ret: any) {
    delete ret._id;
  },
});

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
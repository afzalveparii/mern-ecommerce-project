import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  items: any[];
  totalAmount: number;
  totalItems: number;
  user: mongoose.Types.ObjectId;
  paymentMethod: 'card' | 'cash';
  paymentStatus: string;
  status: string;
  selectedAddress: any;
  id: string;
}

const paymentMethods = {
  values: ['card', 'cash'] as const,
  message: 'enum validator failed for payment Methods'
};

const orderSchema = new Schema({
  items: { type: [Schema.Types.Mixed], required: true },
  totalAmount: { type: Number, min: [1, 'Total amount must be at least 1'], 
    max: [1000000, 'Total amount must not exceed 10,00,000'] },
  totalItems: { type: Number },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  paymentMethod: { type: String, required: true, enum: paymentMethods },
  paymentStatus: { type: String, default: 'pending' },
  status: { type: String, default: 'pending' },
  selectedAddress: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

orderSchema.virtual('id').get(function (this: IOrder) {
  return this._id;
});

orderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc: any, ret: any) {
    delete ret._id;
  },
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);
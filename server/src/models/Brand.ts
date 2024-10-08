import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
  label: string;
  value: string;
  id: string;
}

const brandSchema = new Schema({
  label: { type: String, required: true, unique: true },
  value: { type: String, required: true, unique: true },
});

brandSchema.virtual('id').get(function (this: IBrand) {
  return this._id;
});

brandSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc: any, ret: any) {
    delete ret._id;
  },
});

export const Brand = mongoose.model<IBrand>('Brand', brandSchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  label: string;
  value: string;
  id: string;
}

const categorySchema = new Schema({
  label: { type: String, required: true, unique: true },
  value: { type: String, required: true, unique: true },
});

categorySchema.virtual('id').get(function (this: ICategory) {
  return this._id;
});

categorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc: any, ret: any) {
    delete ret._id;
  },
});

export const Category = mongoose.model<ICategory>('Category', categorySchema);
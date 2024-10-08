import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: Buffer;
  role: string;
  addresses: any[];
  name?: string;
  profilePicture: string;
  salt: Buffer;
  resetPasswordToken: string;
  id: string;
}

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: Buffer, required: true },
  role: { type: String, required: true, default: 'user' },
  addresses: { type: [Schema.Types.Mixed] },
  name: { type: String },
  profilePicture: { type: String, default: '' },
  salt: Buffer,
  resetPasswordToken: { type: String, default: '' }
}, { timestamps: true });

userSchema.virtual('id').get(function (this: IUser) {
  return this._id;
});

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc: any, ret: any) {
    delete ret._id;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
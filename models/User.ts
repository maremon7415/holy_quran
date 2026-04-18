import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  image?: string
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional because of OAuth providers
    image: { type: String },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

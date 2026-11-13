import mongoose, { Schema, type Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  image?: string
  /**
   * The user proved they own `email`. True for accounts created through Google (Google verified the address);
   * false for email + password registrations (no verification mail is sent). A Google login is only attached to an
   * existing account by email when that account has no password or its email is verified — see lib/auth-google.ts.
   */
  emailVerified?: boolean
  /** Google account id (`sub`) linked to this user */
  googleId?: string
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String }, // absent for OAuth-only users
    image: { type: String },
    emailVerified: { type: Boolean, default: false },
    googleId: { type: String, index: { unique: true, sparse: true } },
  },
  { timestamps: true },
)

export default (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema)

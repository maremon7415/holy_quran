import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI


let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  // Checked lazily so the app builds and runs without an account database.
  if (!MONGODB_URI) throw new Error('Accounts are disabled: MONGODB_URI is not configured')
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

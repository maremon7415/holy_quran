import mongoose from 'mongoose'

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
const g = globalThis as unknown as { __noorMongoose?: Cache }
const cached: Cache = (g.__noorMongoose ??= { conn: null, promise: null })

export async function connectDB() {
  // Checked lazily so the app builds and runs without an account database.
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Accounts are disabled: MONGODB_URI is not configured')
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 8000 })
  }
  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }
  return cached.conn
}

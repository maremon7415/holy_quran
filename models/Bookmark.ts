import mongoose, { Schema, Document } from 'mongoose'

export interface IBookmark extends Document {
  userId: string
  type: 'surah' | 'ayah'
  surahNumber: number
  ayahNumber?: number
  title: string
}

const BookmarkSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: ['surah', 'ayah'] },
    surahNumber: { type: Number, required: true },
    ayahNumber: { type: Number },
    title: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.Bookmark || mongoose.model<IBookmark>('Bookmark', BookmarkSchema)

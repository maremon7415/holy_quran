import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import Bookmark from '@/models/Bookmark'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const bookmarks = await Bookmark.find({ userId: session.user.id }).sort({ createdAt: -1 })
    return NextResponse.json(bookmarks)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, surahNumber, ayahNumber, title } = await req.json()
    await connectDB()

    // Check if exists
    const existing = await Bookmark.findOne({
      userId: session.user.id,
      type,
      surahNumber,
      ayahNumber,
    })

    if (existing) {
      await existing.deleteOne()
      return NextResponse.json({ deleted: true })
    }

    const bookmark = await Bookmark.create({
      userId: session.user.id,
      type,
      surahNumber,
      ayahNumber,
      title,
    })

    return NextResponse.json(bookmark)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 })
  }
}

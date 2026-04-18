import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Please fill all fields" },
        { status: 400 }
      )
    }

    await connectDB()

    const exists = await User.findOne({ email })
    if (exists) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await User.create({
      name,
      email,
      password: hashedPassword,
    })

    return NextResponse.json({ message: "User registered" }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    )
  }
}

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import bcrypt from "bcryptjs"
import { connectDB } from "./lib/db"
import User from "./models/User"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID || "",
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    // }),
    // GitHubProvider({
    //   clientId: process.env.GITHUB_ID || "",
    //   clientSecret: process.env.GITHUB_SECRET || "",
    // }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }
        await connectDB()
        const user = await User.findOne({ email: credentials.email })
        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }
        const isCorrectPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        await connectDB()
        const existingUser = await User.findOne({ email: user.email })
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
          })
        }
      }
      return true
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id
      } else if (account?.provider === "google" || account?.provider === "github") {
        // If it's an OAuth login, we need to get their actual MongoDB id
        await connectDB()
        const dbUser = await User.findOne({ email: token.email })
        if (dbUser) {
          token.sub = dbUser._id.toString()
        }
      }
      return token
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

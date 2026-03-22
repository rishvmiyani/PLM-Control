import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma }  from "@/lib/prisma"
import { compare } from "bcryptjs"

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        loginId:  { label: "Login ID",  type: "text"     },
        password: { label: "Password",  type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.loginId || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where:  { loginId: credentials.loginId as string },
          select: { id: true, loginId: true, email: true, password: true, role: true },
        })
        if (!user) return null

        const valid = await compare(credentials.password as string, user.password)
        if (!valid) return null

        return {
          id:      user.id,
          loginId: user.loginId,
          email:   user.email,
          role:    user.role,   // role is the enum string e.g. "APPROVER"
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id      = user.id
        token.loginId = user.loginId
        token.role    = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id      = token.id
      session.user.loginId = token.loginId
      session.user.role    = token.role
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge:   24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
})

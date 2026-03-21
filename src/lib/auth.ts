import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { z } from "zod"

const loginSchema = z.object({
  loginId: z.string().min(1),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        loginId: { label: "Login ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { loginId, password } = parsed.data

        // Dynamic import keeps prisma OUT of edge runtime
        const { prisma } = await import("@/lib/prisma")
        const bcrypt = await import("bcryptjs")

        const user = await prisma.user.findUnique({ where: { loginId } })
        if (!user) return null

        const match = await bcrypt.compare(password, user.password)
        if (!match) return null

        return {
          id: user.id,
          email: user.email,
          name: user.loginId,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
        token.loginId = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.loginId = token.loginId as string
      }
      return session
    },
  },
})

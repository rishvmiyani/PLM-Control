import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signupSchema = z.object({
  loginId: z.string().min(6).max(12),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { loginId, email, password } = parsed.data

    const existingLoginId = await prisma.user.findUnique({ where: { loginId } })
    if (existingLoginId) {
      return NextResponse.json(
        { error: "Login ID already taken", field: "loginId" },
        { status: 409 }
      )
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already registered", field: "email" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        loginId,
        email,
        password: hashedPassword,
        role: "ENGINEERING",
      },
    })

    return NextResponse.json({ id: user.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

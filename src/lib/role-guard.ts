import { auth } from "@/lib/auth"
import { hasPermission, Permission } from "@/lib/permissions"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

// ── Use in Server Components / Pages ─────────────────────
export async function requirePermission(permission: Permission) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!hasPermission(role, permission)) {
    redirect("/dashboard")
  }
  return session
}

// ── Use in API Routes ─────────────────────────────────────
export async function apiRequirePermission(permission: Permission) {
  const session = await auth()

  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  const role = session.user.role as Role
  if (!hasPermission(role, permission)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return { session, error: null }
}

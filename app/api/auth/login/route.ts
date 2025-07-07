import { type NextRequest, NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"
import bcrypt from "bcryptjs"

/* Use the same demoUsers array declared in register route via globalThis */
const demoUsers =
  (globalThis as any).__demoUsers ||
  ((globalThis as any).__demoUsers = [] as { id: number; email: string; password: string; name: string }[])

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  /* -------------------------- NO DATABASE MODE --------------------------- */
  if (!hasDb) {
    const user = demoUsers.find((u) => u.email === email)
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const { password: _pw, ...safe } = user
    return NextResponse.json({ success: true, user: safe })
  }

  /* --------------------------- REAL DATABASE ----------------------------- */
  try {
    const rows = await sql`SELECT * FROM users WHERE email = ${email}`
    const userRow = Array.isArray(rows) ? rows[0] : (rows as { rows: any[] }).rows?.[0]

    if (!userRow) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const ok = await bcrypt.compare(password, userRow.password)
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const { password: _pw, ...safe } = userRow
    return NextResponse.json({ success: true, user: safe })
  } catch (err) {
    console.error("Login DB error:", (err as Error).message)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

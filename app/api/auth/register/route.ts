import { type NextRequest, NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"
import bcrypt from "bcryptjs"

type DemoUser = {
  id: number
  email: string
  password: string /* hashed */
  name: string
  phone?: string
  created_at: string
}

// Global demo users store
const demoUsers = (globalThis as any).__demoUsers || ((globalThis as any).__demoUsers = [] as DemoUser[])
let demoUserId = demoUsers.length > 0 ? Math.max(...demoUsers.map((u) => u.id)) + 1 : 1

export async function POST(req: NextRequest) {
  const { email, password, name, phone } = await req.json()

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Email, password and name are required" }, { status: 400 })
  }

  /* -------------------------- NO DATABASE MODE --------------------------- */
  if (!hasDb) {
    console.log("📝 Registering user in DEMO mode:", email)

    if (demoUsers.some((u) => u.email === email)) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const newUser: DemoUser = {
      id: demoUserId++,
      email,
      password: hashed,
      name,
      phone,
      created_at: new Date().toISOString(),
    }

    demoUsers.push(newUser)
    console.log("✅ Demo user registered:", newUser.name, "Total users:", demoUsers.length)

    const { password: _, ...safe } = newUser
    return NextResponse.json({ success: true, user: safe })
  }

  /* --------------------------- REAL DATABASE ----------------------------- */
  try {
    console.log("📝 Registering user in DATABASE mode:", email)

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    const existingArray = Array.isArray(existing) ? existing : existing.rows || []

    if (existingArray.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const inserted = await sql`
      INSERT INTO users (email, password, name, phone)
      VALUES (${email}, ${hashed}, ${name}, ${phone ?? null})
      RETURNING id, email, name, phone, created_at
    `

    const userRow = Array.isArray(inserted) ? inserted[0] : inserted.rows?.[0]
    console.log("✅ Database user registered:", userRow?.name)

    return NextResponse.json({ success: true, user: userRow })
  } catch (err) {
    console.error("❌ Register DB error:", (err as Error).message)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

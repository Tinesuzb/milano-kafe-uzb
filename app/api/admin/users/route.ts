import { NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

// Get demo users from global store
const demoUsers = (globalThis as any).__demoUsers || ((globalThis as any).__demoUsers = [] as any[])

export async function GET() {
  if (!hasDb) {
    console.log("👥 Fetching users in DEMO mode, count:", demoUsers.length)
    return NextResponse.json({
      users: demoUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at,
      })),
    })
  }

  try {
    console.log("👥 Fetching users from DATABASE")
    const users = await sql`
      SELECT id, name, email, phone, created_at 
      FROM users 
      ORDER BY created_at DESC
    `

    const usersArray = Array.isArray(users) ? users : users.rows || []
    console.log("✅ Fetched users from database, count:", usersArray.length)

    return NextResponse.json({ users: usersArray })
  } catch (error) {
    console.error("❌ Error fetching users:", error)
    // Fallback to demo users if database fails
    return NextResponse.json({ users: demoUsers })
  }
}

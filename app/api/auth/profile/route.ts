import { type NextRequest, NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

export async function PUT(req: NextRequest) {
  const { userId, name, email, phone, address } = await req.json()

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  if (!hasDb) {
    // For demo mode, just return success
    return NextResponse.json({ success: true })
  }

  try {
    await sql`
      UPDATE users 
      SET name = ${name}, email = ${email}, phone = ${phone}, address = ${address}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

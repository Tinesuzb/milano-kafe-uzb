// lib/db.ts
import { neon } from "@neondatabase/serverless"

// Doimiy ravishda haqiqiy ma'lumotlar bazasiga ulanish
export const sql = neon(process.env.DATABASE_URL!)

// Bazaga ulanishni tekshirish uchun funksiya
export async function testConnection() {
  try {
    await sql`SELECT 1 as test`
    console.log("✅ Database connection successful")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

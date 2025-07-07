import { NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

const demoCategories = [
  { id: 1, name_uz: "Pitsalar25cm", name_ru: "Пиццы25cm", name_en: "Pizzas25cm" },
  { id: 2, name_uz: "Pitsalar30cm", name_ru: "Пиццы30cm", name_en: "Pizzas30cm" },
  { id: 3, name_uz: "Pitsalar35cm", name_ru: "Пиццы35cm", name_en: "Pizzas35cm" },
  { id: 4, name_uz: "Ichimlik", name_ru: "Напиток", name_en: "Drink" },
  { id: 5, name_uz: "Lavash", name_ru: "Лаваш", name_en: "Lavash" },
  { id: 6, name_uz: "Hotdog", name_ru: "Хот-дог", name_en: "Hot dog" },
  { id: 7, name_uz: "Seteyk", name_ru: "Стейк", name_en: "Steak" },
  { id: 8, name_uz: "Soup", name_ru: "Суп", name_en: "Soup" },
]

/**
 * GET /api/categories – returns menu categories.
 * Provides demo categories when the DB is unavailable.
 */
export async function GET() {
  if (!hasDb) {
    return NextResponse.json({ categories: demoCategories })
  }

  try {
    const rows = await sql`SELECT * FROM categories ORDER BY id`
    return NextResponse.json({ categories: rows })
  } catch (err) {
    console.error("DB error in /api/categories:", (err as Error).message)
    return NextResponse.json({ categories: demoCategories })
  }
}

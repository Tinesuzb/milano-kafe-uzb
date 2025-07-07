// app/api/orders/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

type LineItem = { id: number; quantity: number; price: number }
type Order = {
  id: number
  user_id: number | null
  total_amount: number
  status: string
  delivery_address: string
  latitude?: number | null
  longitude?: number | null
  phone: string
  notes?: string | null
  payment_method: string
  created_at: string
  items: LineItem[]
}

/* -------------------------------------------------------------------------- */
/* POST  – Yangi buyurtma yaratish                                            */
/* -------------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  const { userId, items, totalAmount, deliveryAddress, latitude, longitude, phone, notes, paymentMethod } =
    await req.json()

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Order items are required" }, { status: 400 })
  }

  try {
    // orders jadvaliga yangi buyurtma qo'shish
    const inserted = await sql`
      INSERT INTO orders
        (user_id,total_amount,delivery_address,latitude,longitude,phone,notes,payment_method)
      VALUES
        (${userId ?? null},${totalAmount},${deliveryAddress},${latitude ?? null},
         ${longitude ?? null},${phone},${notes ?? null},${paymentMethod})
      RETURNING *
    `
    // Natijani normalizatsiya qilish
    const orderRow: any = Array.isArray(inserted)
      ? inserted[0]
      : (inserted as { rows: any[] }).rows?.[0]

    if (!orderRow) {
      throw new Error("Failed to retrieve created order")
    }

    // order_items jadvaliga buyurtma elementlarini qo'shish
    for (const it of items as LineItem[]) {
      await sql`
        INSERT INTO order_items (order_id,menu_item_id,quantity,price)
        VALUES (${orderRow.id},${it.id},${it.quantity},${it.price})
      `
    }

    return NextResponse.json({ success: true, order: orderRow })
  } catch (err) {
    console.error("DB error (create order):", (err as Error).message)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

/* -------------------------------------------------------------------------- */
/* GET  – Buyurtmalarni olish (barchasi yoki ma'lum foydalanuvchi buyurtmalari) */
/* -------------------------------------------------------------------------- */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  try {
    const rows =
      userId !== null
        ? await sql`
            SELECT
              o.*,
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'menu_item_id', oi.menu_item_id,
                  'quantity', oi.quantity,
                  'price', oi.price
                )
              ) AS items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ${userId}
            GROUP BY o.id
            ORDER BY o.created_at DESC
          `
        : await sql`
            SELECT
              o.*,
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'menu_item_id', oi.menu_item_id,
                  'quantity', oi.quantity,
                  'price', oi.price
                )
              ) AS items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC
          `

    return NextResponse.json({ orders: Array.isArray(rows) ? rows : (rows as any).rows })
  } catch (err) {
    console.error("DB error (fetch orders):", (err as Error).message)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}


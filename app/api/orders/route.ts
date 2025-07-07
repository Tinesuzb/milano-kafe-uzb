// app/api/orders/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

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

// Demo orders for testing
const demoOrders = (globalThis as any).__demoOrders || ((globalThis as any).__demoOrders = [] as any[])
let demoOrderId = demoOrders.length > 0 ? Math.max(...demoOrders.map((o) => o.id)) + 1 : 1

// Demo menu items for name mapping
const demoMenuItems = [
  { id: 1, name_uz: "Margherita Pizza", name_ru: "Пицца Маргарита", name_en: "Margherita Pizza" },
  { id: 2, name_uz: "Pepperoni Pizza", name_ru: "Пицца Пепперони", name_en: "Pepperoni Pizza" },
  { id: 3, name_uz: "Milano Burger", name_ru: "Бургер Милано", name_en: "Milano Burger" },
  { id: 4, name_uz: "Caesar Salad", name_ru: "Салат Цезарь", name_en: "Caesar Salad" },
  { id: 5, name_uz: "Coca Cola", name_ru: "Кока Кола", name_en: "Coca Cola" },
  { id: 6, name_uz: "Chicken Lavash", name_ru: "Лаваш с курицей", name_en: "Chicken Lavash" },
]

/* -------------------------------------------------------------------------- */
/* POST  – Yangi buyurtma yaratish                                            */
/* -------------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  const { userId, items, totalAmount, deliveryAddress, latitude, longitude, phone, notes, paymentMethod } =
    await req.json()

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Order items are required" }, { status: 400 })
  }

  if (!hasDb) {
    // Demo mode
    const newOrder = {
      id: demoOrderId++,
      user_id: userId || null,
      user_name: userId ? "Demo User" : null,
      user_email: userId ? "demo@example.com" : null,
      total_amount: totalAmount,
      status: "pending",
      delivery_address: deliveryAddress,
      latitude: latitude || null,
      longitude: longitude || null,
      phone,
      notes: notes || null,
      payment_method: paymentMethod,
      created_at: new Date().toISOString(),
      items: items.map((item: any) => ({
        id: item.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
        name: demoMenuItems.find(m => m.id === item.id)?.name_uz || `Mahsulot ${item.id}`
      }))
    }
    
    demoOrders.push(newOrder)
    console.log("✅ Demo order created:", newOrder.id)
    return NextResponse.json({ success: true, order: newOrder })
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

  if (!hasDb) {
    // Demo mode
    const filteredOrders = userId 
      ? demoOrders.filter(order => order.user_id === parseInt(userId))
      : demoOrders
    
    console.log("📋 Fetching demo orders, count:", filteredOrders.length)
    return NextResponse.json({ orders: filteredOrders })
  }

  try {
    const rows =
      userId !== null
        ? await sql`
            SELECT
              o.*,
              u.name as user_name,
              u.email as user_email,
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'menu_item_id', oi.menu_item_id,
                  'quantity', oi.quantity,
                  'price', oi.price,
                  'name', COALESCE(m.name_uz, 'Mahsulot ' || oi.menu_item_id)
                )
              ) AS items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN menu_items m ON oi.menu_item_id = m.id
            WHERE o.user_id = ${userId}
            GROUP BY o.id, u.name, u.email
            ORDER BY o.created_at DESC
          `
        : await sql`
            SELECT
              o.*,
              u.name as user_name,
              u.email as user_email,
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'menu_item_id', oi.menu_item_id,
                  'quantity', oi.quantity,
                  'price', oi.price,
                  'name', COALESCE(m.name_uz, 'Mahsulot ' || oi.menu_item_id)
                )
              ) AS items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN menu_items m ON oi.menu_item_id = m.id
            GROUP BY o.id, u.name, u.email
            ORDER BY o.created_at DESC
          `

    return NextResponse.json({ orders: Array.isArray(rows) ? rows : (rows as any).rows })
  } catch (err) {
    console.error("DB error (fetch orders):", (err as Error).message)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
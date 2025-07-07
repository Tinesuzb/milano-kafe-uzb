// app/api/orders/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

// Demo orders reference
const demoOrders = (globalThis as any).__demoOrders || ((globalThis as any).__demoOrders = [] as any[])

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { status } = await request.json()
  const orderId = Number.parseInt(params.id)

  if (!hasDb) {
    // Demo mode
    const orderIndex = demoOrders.findIndex((order: any) => order.id === orderId)
    if (orderIndex !== -1) {
      demoOrders[orderIndex].status = status
      demoOrders[orderIndex].updated_at = new Date().toISOString()
      console.log("✅ Demo order status updated:", orderId, "->", status)
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  try {
    await sql`
      UPDATE orders
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
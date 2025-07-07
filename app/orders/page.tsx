"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { ShoppingBag, MapPin, Phone, Calendar, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface Order {
  id: number
  total_amount: number
  status: string
  delivery_address: string
  phone: string
  created_at: string
  items: any[]
}

export default function OrdersPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }
    fetchUserOrders()
  }, [user, router])

  const fetchUserOrders = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/orders?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-orange-100 text-orange-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "delivered":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Kutilmoqda"
      case "confirmed":
        return "Tasdiqlandi"
      case "preparing":
        return "Tayyorlanmoqda"
      case "ready":
        return "Tayyor"
      case "delivered":
        return "Yetkazildi"
      default:
        return status
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Mening buyurtmalarim</h1>
          <p className="text-gray-600">Barcha buyurtmalaringizni bu yerda kuzatishingiz mumkin</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5" />
              <span>Buyurtmalar tarixi</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Sizda hali buyurtmalar yo'q</p>
                <Button onClick={() => router.push("/menu")} className="bg-orange-600 hover:bg-orange-700">
                  Menyu ko'rish
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 md:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Buyurtma #{order.id}</h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(order.created_at).toLocaleDateString("uz-UZ", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{order.delivery_address}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{order.phone}</span>
                          </div>
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium text-gray-700 mb-3">Buyurtma tarkibi:</p>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600">{item.name || `Mahsulot ${item.menu_item_id}`}</span>
                                  <span className="font-medium">
                                    {item.quantity}x {formatPrice(item.price)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-right lg:ml-6">
                        <p className="text-2xl font-bold text-orange-600">{formatPrice(order.total_amount)}</p>
                        <p className="text-sm text-gray-500 mt-1">Jami summa</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}

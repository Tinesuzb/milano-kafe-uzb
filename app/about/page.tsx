"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { ShoppingBag, Users, Eye, Check, Clock, ChefHat, Truck, CheckCircle, RefreshCw } from "lucide-react"

interface Order {
  id: number
  user_name?: string
  user_email?: string
  total_amount: number
  status: string
  delivery_address: string
  phone: string
  created_at: string
  items: any[]
}

interface User {
  id: number
  name: string
  email: string
  phone?: string
  created_at: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")
  const { toast } = useToast()
  const { t } = useLanguage()
  const prevOrdersRef = useRef<Order[]>([]) // Oldingi buyurtmalarni saqlash uchun
  const audioRef = useRef<HTMLAudioElement | null>(null) // Ringtone uchun ref

  const ADMIN_PASSWORD = "admin123"

  useEffect(() => {
    // Audio ob'ektini yaratish
    audioRef.current = new Audio("/notification.mp3")
    audioRef.current.preload = "auto"

    if (isAuthenticated) {
      fetchOrders()
      fetchUsers()
      // Auto-refresh har 30 soniyada
      const interval = setInterval(() => {
        fetchOrders()
        fetchUsers()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      toast({
        title: t("success"),
        description: "Admin paneliga xush kelibsiz!",
      })
    } else {
      toast({
        title: t("error"),
        description: "Noto'g'ri parol",
        variant: "destructive",
      })
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        const newOrders = data.orders || []

        // Yangi buyurtmalarni aniqlash
        const currentOrderIds = new Set(orders.map((order) => order.id))
        const newOrderIds = newOrders.filter((order: Order) => !currentOrderIds.has(order.id))

        if (newOrderIds.length > 0) {
          // Yangi buyurtma kelganda ringtone o'ynash
          if (audioRef.current) {
            audioRef.current.play().catch((error) => console.error("Ringtone oynatishda xato:", error))
            // 5 soniyadan keyin ringtone to'xtatish
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
              }
            }, 5000)
          }
        }

        // Buyurtmalarni yangilash
        setOrders(newOrders)
        prevOrdersRef.current = newOrders
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchOrders(), fetchUsers()])
    setIsRefreshing(false)
    toast({
      title: "Yangilandi",
      description: "Ma'lumotlar yangilandi",
    })
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: t("success"),
          description: `Buyurtma holati ${getStatusText(status)} ga o'zgartirildi`,
        })
        // Lokal holatni darhol yangilash
        setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status } : order)))
        // Yangi ma'lumotlarni olish
        fetchOrders()
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: "Buyurtma holatini o'zgartirishda xatolik",
        variant: "destructive",
      })
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
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "preparing":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "ready":
        return "bg-green-100 text-green-800 border-green-200"
      case "delivered":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Yangi buyurtma"
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock
      case "confirmed":
        return Check
      case "preparing":
        return ChefHat
      case "ready":
        return Truck
      case "delivered":
        return CheckCircle
      default:
        return Clock
    }
  }

  // Buyurtmalarni holat bo'yicha filtrlash
  const filterOrdersByStatus = (status: string) => {
    switch (status) {
      case "pending":
        return orders.filter((order) => order.status === "pending")
      case "active":
        return orders.filter((order) => ["confirmed", "preparing", "ready"].includes(order.status))
      case "completed":
        return orders.filter((order) => order.status === "delivered")
      default:
        return orders
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return "confirmed"
      case "confirmed":
        return "preparing"
      case "preparing":
        return "ready"
      case "ready":
        return "delivered"
      default:
        return null
    }
  }

  const getNextStatusText = (currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus)
    return nextStatus ? getStatusText(nextStatus) : null
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">🔐 Admin Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="password">Admin Parol</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="admin123"
                />
              </div>
              <Button onClick={handleLogin} className="w-full bg-orange-600 hover:bg-orange-700">
                Kirish
              </Button>
              <p className="text-sm text-gray-500 text-center">Demo parol: admin123</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const pendingOrders = filterOrdersByStatus("pending")
  const activeOrders = filterOrdersByStatus("active")
  const completedOrders = filterOrdersByStatus("completed")

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="mb-6 md:mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">🏪 Admin Dashboard</h1>
            <p className="text-gray-600">Milano Cafe boshqaruv paneli</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Yangilash</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Jami buyurtmalar</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Foydalanuvchilar</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Yangi</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Faol</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{activeOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">📋 Buyurtmalar</TabsTrigger>
            <TabsTrigger value="users">👥 Foydalanuvchilar</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Sozlamalar</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="text-xs md:text-sm">
                  🆕 Yangi ({pendingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs md:text-sm">
                  🔄 Faol ({activeOrders.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs md:text-sm">
                  ✅ Yakunlangan ({completedOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span>Yangi buyurtmalar</span>
                      {pendingOrders.length > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800">{pendingOrders.length}</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrdersList
                      orders={pendingOrders}
                      onUpdateStatus={updateOrderStatus}
                      onViewOrder={setSelectedOrder}
                      isLoading={isLoading}
                      formatPrice={formatPrice}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                      getNextStatusText={getNextStatusText}
                      getNextStatus={getNextStatus}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="active">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ChefHat className="h-5 w-5 text-orange-600" />
                      <span>Faol buyurtmalar</span>
                      {activeOrders.length > 0 && (
                        <Badge className="bg-orange-100 text-orange-800">{activeOrders.length}</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrdersList
                      orders={activeOrders}
                      onUpdateStatus={updateOrderStatus}
                      onViewOrder={setSelectedOrder}
                      isLoading={isLoading}
                      formatPrice={formatPrice}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                      getNextStatusText={getNextStatusText}
                      getNextStatus={getNextStatus}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="completed">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Yakunlangan buyurtmalar</span>
                      {completedOrders.length > 0 && (
                        <Badge className="bg-green-100 text-green-800">{completedOrders.length}</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrdersList
                      orders={completedOrders}
                      onUpdateStatus={updateOrderStatus}
                      onViewOrder={setSelectedOrder}
                      isLoading={isLoading}
                      formatPrice={formatPrice}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                      getNextStatusText={getNextStatusText}
                      getNextStatus={getNextStatus}
                      showActions={false}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Ro'yxatdan o'tgan foydalanuvchilar</span>
                  {users.length > 0 && <Badge className="bg-blue-100 text-blue-800">{users.length}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Hali foydalanuvchilar yo'q</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Yangi foydalanuvchilar ro'yxatdan o'tganda bu yerda ko'rinadi
                      </p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                {user.phone && <p className="text-sm text-gray-600">📞 {user.phone}</p>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              📅{" "}
                              {new Date(user.created_at).toLocaleDateString("uz-UZ", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Sozlamalar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">📊 Tizim ma'lumotlari</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Jami buyurtmalar:</span>
                        <span className="font-semibold ml-2">{orders.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Foydalanuvchilar:</span>
                        <span className="font-semibold ml-2">{users.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Bugungi buyurtmalar:</span>
                        <span className="font-semibold ml-2">
                          {
                            orders.filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString())
                              .length
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Faol buyurtmalar:</span>
                        <span className="font-semibold ml-2">{activeOrders.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Admin sozlamalari</h3>
                    <p className="text-sm text-yellow-800 mb-4">
                      Admin parol: <code className="bg-yellow-200 px-2 py-1 rounded">admin123</code>
                    </p>
                    <Button
                      onClick={() => {
                        setIsAuthenticated(false)
                        setPassword("")
                      }}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      🚪 Admin paneldan chiqish
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📋 Buyurtma tafsilotlari #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>👤 Mijoz</Label>
                  <p className="font-semibold">{selectedOrder.user_name || "Mehmon"}</p>
                </div>
                <div>
                  <Label>📞 Telefon</Label>
                  <p className="font-semibold">{selectedOrder.phone}</p>
                </div>
                <div>
                  <Label>📊 Holat</Label>
                  <Badge className={getStatusColor(selectedOrder.status)}>{getStatusText(selectedOrder.status)}</Badge>
                </div>
                <div>
                  <Label>💰 Jami summa</Label>
                  <p className="font-semibold text-orange-600">{formatPrice(selectedOrder.total_amount)}</p>
                </div>
              </div>
              <div>
                <Label>📍 Yetkazish manzili</Label>
                <p className="font-semibold">{selectedOrder.delivery_address}</p>
              </div>
              <div>
                <Label>🍽️ Buyurtma tarkibi</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <span>{item.name || `Mahsulot ${item.menu_item_id}`}</span>
                      <span className="font-semibold">
                        {item.quantity}x {formatPrice(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                📅 Buyurtma vaqti: {new Date(selectedOrder.created_at).toLocaleString("uz-UZ")}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Orders List Component
function OrdersList({
  orders,
  onUpdateStatus,
  onViewOrder,
  isLoading,
  formatPrice,
  getStatusColor,
  getStatusText,
  getNextStatusText,
  getNextStatus,
  showActions = true,
}: {
  orders: Order[]
  onUpdateStatus: (id: number, status: string) => void
  onViewOrder: (order: Order) => void
  isLoading: boolean
  formatPrice: (price: number) => string
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
  getNextStatusText: (status: string) => string | null
  getNextStatus: (status: string) => string | null
  showActions?: boolean
}) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Bu bo'limda buyurtmalar yo'q</p>
        <p className="text-sm text-gray-500 mt-2">Yangi buyurtmalar kelganda bu yerda ko'rinadi</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <p className="font-semibold">📋 Buyurtma #{order.id}</p>
                  <p className="text-sm text-gray-600">
                    👤 {order.user_name || "Mehmon"} - 📞 {order.phone}
                  </p>
                  <p className="text-sm text-gray-600 truncate">📍 {order.delivery_address}</p>
                  <p className="text-xs text-gray-500">📅 {new Date(order.created_at).toLocaleString("uz-UZ")}</p>
                </div>
                <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-right">
                <p className="font-bold text-orange-600">{formatPrice(order.total_amount)}</p>
              </div>
              {showActions && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewOrder(order)}
                    className="bg-blue-50 hover:bg-blue-100 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ko'rish
                  </Button>
                  {getNextStatus(order.status) && (
                    <Button
                      size="sm"
                      onClick={() => onUpdateStatus(order.id, getNextStatus(order.status)!)}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      {getNextStatusText(order.status)}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

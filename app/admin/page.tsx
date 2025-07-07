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
import { 
  ShoppingBag, 
  Users, 
  Eye, 
  Check, 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Package,
  AlertCircle,
  Star,
  Filter,
  Search,
  Download,
  BarChart3
} from "lucide-react"

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
  notes?: string
  payment_method?: string
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
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const { toast } = useToast()
  const { t } = useLanguage()
  const prevOrdersRef = useRef<Order[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const ADMIN_PASSWORD = "admin123"

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3")
    audioRef.current.preload = "auto"

    if (isAuthenticated) {
      fetchOrders()
      fetchUsers()
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

        const currentOrderIds = new Set(orders.map((order) => order.id))
        const newOrderIds = newOrders.filter((order: Order) => !currentOrderIds.has(order.id))

        if (newOrderIds.length > 0) {
          if (audioRef.current) {
            audioRef.current.play().catch((error) => console.error("Ringtone oynatishda xato:", error))
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
              }
            }, 20000)
          }
        }

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
        setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status } : order)))
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
      case "delivered":
        return "Yakunlangan"
      default:
        return status
    }
  }

  const filterOrdersByStatus = (status: string) => {
    let filtered = orders
    
    switch (status) {
      case "pending":
        filtered = orders.filter((order) => order.status === "pending")
        break
      case "completed":
        filtered = orders.filter((order) => order.status === "delivered")
        break
      default:
        filtered = orders
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((order) => 
        order.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone.includes(searchQuery) ||
        order.id.toString().includes(searchQuery)
      )
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at)
        switch (dateFilter) {
          case "today":
            return orderDate >= today
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return orderDate >= weekAgo
          case "month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            return orderDate >= monthAgo
          default:
            return true
        }
      })
    }

    return filtered
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return "confirmed"
      case "confirmed":
        return "delivered"
      default:
        return null
    }
  }

  const getNextStatusText = (currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus)
    return nextStatus ? getStatusText(nextStatus) : null
  }

  // Analytics calculations
  const todayOrders = orders.filter(order => {
    const today = new Date().toDateString()
    return new Date(order.created_at).toDateString() === today
  })

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0)
  const avgOrderValue = orders.length > 0 ? orders.reduce((sum, order) => sum + order.total_amount, 0) / orders.length : 0

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">🔐 Admin Panel</CardTitle>
              <p className="text-gray-600">Milano Cafe boshqaruv tizimi</p>
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
                  className="mt-1"
                />
              </div>
              <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
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
  const completedOrders = filterOrdersByStatus("completed")

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header Section */}
        <div className="mb-6 md:mb-8 flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">🏪 Admin Dashboard</h1>
            <p className="text-gray-600">Milano Cafe boshqaruv paneli</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Yangilash</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Jami buyurtmalar</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{orders.length}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% bu oy
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Foydalanuvchilar</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{users.length}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5% bu hafta
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Yangi</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
                  <p className="text-xs text-yellow-600 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Kutilmoqda
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Bugungi daromad</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{formatPrice(todayRevenue)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {todayOrders.length} buyurtma
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">O'rtacha buyurtma</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{formatPrice(avgOrderValue)}</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Statistika
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">📋 Buyurtmalar</TabsTrigger>
            <TabsTrigger value="users">👥 Foydalanuvchilar</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analitika</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buyurtma, mijoz yoki telefon bo'yicha qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">Barcha vaqt</option>
                      <option value="today">Bugun</option>
                      <option value="week">Bu hafta</option>
                      <option value="month">Bu oy</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending" className="text-xs md:text-sm">
                  🆕 Yangi ({pendingOrders.length})
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
                                <p className="text-sm text-gray-600 flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {user.email}
                                </p>
                                {user.phone && (
                                  <p className="text-sm text-gray-600 flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {user.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 flex items-center justify-end">
                              <Calendar className="h-3 w-3 mr-1" />
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

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>📊 Tizim ma'lumotlari</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-600">Jami buyurtmalar:</span>
                        <span className="font-semibold ml-2 text-blue-600">{orders.length}</span>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <span className="text-gray-600">Foydalanuvchilar:</span>
                        <span className="font-semibold ml-2 text-green-600">{users.length}</span>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <span className="text-gray-600">Bugungi buyurtmalar:</span>
                        <span className="font-semibold ml-2 text-yellow-600">{todayOrders.length}</span>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <span className="text-gray-600">Yakunlangan:</span>
                        <span className="font-semibold ml-2 text-purple-600">{completedOrders.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>⚙️ Admin sozlamalari</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Xavfsizlik</h3>
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
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Buyurtma tafsilotlari #{selectedOrder?.id}</span>
              <Badge className={selectedOrder ? getStatusColor(selectedOrder.status) : ""}>
                {selectedOrder ? getStatusText(selectedOrder.status) : ""}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Mijoz ma'lumotlari
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold">{selectedOrder.user_name || "Mehmon"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedOrder.phone}</span>
                    </div>
                    {selectedOrder.user_email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedOrder.user_email}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Yetkazish ma'lumotlari
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span>{selectedOrder.delivery_address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-orange-600">{formatPrice(selectedOrder.total_amount)}</span>
                    </div>
                    {selectedOrder.payment_method && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">To'lov usuli: {selectedOrder.payment_method}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Buyurtma tarkibi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <span className="font-medium">{item.name || `Mahsulot ${item.menu_item_id}`}</span>
                          <div className="text-sm text-gray-600">
                            {item.quantity} x {formatPrice(item.price)}
                          </div>
                        </div>
                        <span className="font-semibold text-orange-600">
                          {formatPrice(item.quantity * item.price)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
                      <span>Jami:</span>
                      <span className="text-orange-600">{formatPrice(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Qo'shimcha izohlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Buyurtma vaqti
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Buyurtma berilgan: {new Date(selectedOrder.created_at).toLocaleString("uz-UZ")}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Enhanced Orders List Component
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
      <div className="text-center py-12">
        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Bu bo'limda buyurtmalar yo'q</p>
        <p className="text-sm text-gray-500 mt-2">Yangi buyurtmalar kelganda bu yerda ko'rinadi</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-all duration-200 hover:shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <p className="font-semibold text-lg">📋 Buyurtma #{order.id}</p>
                    <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {order.user_name || "Mehmon"}
                    </p>
                    <p className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {order.phone}
                    </p>
                    <p className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{order.delivery_address}</span>
                    </p>
                    <p className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(order.created_at).toLocaleString("uz-UZ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-right">
                <p className="font-bold text-xl text-orange-600">{formatPrice(order.total_amount)}</p>
                <p className="text-sm text-gray-500">{order.items?.length || 0} mahsulot</p>
              </div>
              {showActions && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewOrder(order)}
                    className="bg-blue-50 hover:bg-blue-100 text-xs border-blue-200"
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
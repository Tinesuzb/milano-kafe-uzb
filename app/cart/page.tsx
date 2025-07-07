"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LocationPicker } from "@/components/location-picker"
import { Minus, Plus, Trash2, CreditCard } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const { t } = useLanguage()
  const { toast } = useToast()

  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [latitude, setLatitude] = useState<number | undefined>()
  const [longitude, setLongitude] = useState<number | undefined>()
  const [phone, setPhone] = useState(user?.phone || "")
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm"
  }

  const handleLocationSelect = (address: string, lat?: number, lng?: number) => {
    setDeliveryAddress(address)
    setLatitude(lat)
    setLongitude(lng)
  }

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast({
        title: t("error"),
        description: "Your cart is empty",
        variant: "destructive",
      })
      return
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: t("error"),
        description: "Please enter delivery address",
        variant: "destructive",
      })
      return
    }

    if (!phone.trim()) {
      toast({
        title: t("error"),
        description: "Please enter phone number",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          items,
          totalAmount: getTotalPrice(),
          deliveryAddress,
          latitude,
          longitude,
          phone,
          notes,
          paymentMethod,
        }),
      })

      if (response.ok) {
        toast({
          title: t("success"),
          description: t("orderSuccess"),
        })
        clearCart()
        setDeliveryAddress("")
        setNotes("")
      } else {
        throw new Error("Failed to submit order")
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: "Failed to submit order",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("cart")}</h1>
            <p className="text-gray-600 mb-8">Your cart is empty</p>
            <Button onClick={() => (window.location.href = "/menu")} className="bg-orange-600 hover:bg-orange-700">
              Browse Menu
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("cart")}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image_url || "/placeholder.svg?height=80&width=80"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-orange-600 font-bold">{formatPrice(item.price)}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>{t("total")}:</span>
                    <span className="text-orange-600">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
                <div className="space-y-4">
                  <LocationPicker onLocationSelect={handleLocationSelect} initialAddress={deliveryAddress} />

                  <div>
                    <Label htmlFor="phone">{t("phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+998 90 123 45 67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Special instructions for your order"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>{t("paymentMethod")}</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            {t("cash")}
                          </div>
                        </SelectItem>
                        <SelectItem value="click">
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Click
                          </div>
                        </SelectItem>
                        <SelectItem value="payme">
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Payme
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 text-lg font-semibold"
                >
                  {isSubmitting ? t("loading") : `${t("order")} (${formatPrice(getTotalPrice())})`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

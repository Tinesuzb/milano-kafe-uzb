"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Plus } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useCart } from "@/contexts/cart-context"

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  rating: number
  isPopular?: boolean
}

const featuredItems: MenuItem[] = [
  {
    id: 1,
    name: "Milano Burger",
    description: "Premium beef burger with special Milano sauce",
    price: 25000,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqboUraTf-hVuGJyiB6337nXw8BhuU2kBQttJQCFHkhTtQnroM3lRDDCwrOy20hDEt5Ms&usqp=CAU",
    category: "Burgers",
    rating: 4.9,
    isPopular: true,
  },
  {
    id: 2,
    name: "Margherita Pizza",
    description: "Classic Italian pizza with fresh mozzarella and basil",
    price: 35000,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqboUraTf-hVuGJyiB6337nXw8BhuU2kBQttJQCFHkhTtQnroM3lRDDCwrOy20hDEt5Ms&usqp=CAU",
    category: "Pizza",
    rating: 4.8,
  },
  {
    id: 3,
    name: "Gourmet Hot Dog",
    description: "Premium sausage with artisanal toppings",
    price: 18000,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqboUraTf-hVuGJyiB6337nXw8BhuU2kBQttJQCFHkhTtQnroM3lRDDCwrOy20hDEt5Ms&usqp=CAU",
    category: "Hot Dogs",
    rating: 4.7,
  },
];

export function FeaturedMenu() {
  const { t } = useLanguage()
  const { addToCart } = useCart()
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm"
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t("ourMenu")}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our most popular dishes, crafted with the finest ingredients and served with passion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredItems.map((item) => (
            <Card
              key={item.id}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                hoveredItem === item.id ? "scale-105" : ""
              }`}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {item.isPopular && (
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      🔥 {t("popular")}
                    </Badge>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{item.rating}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-orange-600">{formatPrice(item.price)}</div>
                    <Button
                      size="sm"
                      onClick={() =>
                        addToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image_url: item.image_url,
                        })
                      }
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-full px-4 py-2 transition-all duration-300 hover:shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {t("addToCart")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300"
          >
            View Full Menu
          </Button>
        </div>
      </div>
    </section>
  )
}

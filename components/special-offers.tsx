"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Percent, Gift } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const offers = [
  {
    id: 1,
    title: "Pizza Monday",
    description: "20% off on all pizzas every Monday",
    discount: "20%",
    validUntil: "Every Monday",
    icon: Percent,
    color: "from-red-500 to-pink-500",
  },
  {
    id: 2,
    title: "Happy Hour",
    description: "Buy 2 burgers, get 1 free drink",
    discount: "Free Drink",
    validUntil: "3PM - 6PM Daily",
    icon: Clock,
    color: "from-blue-500 to-purple-500",
  },
  {
    id: 3,
    title: "Weekend Special",
    description: "Family combo for 4 people at special price",
    discount: "30%",
    validUntil: "Weekends Only",
    icon: Gift,
    color: "from-green-500 to-teal-500",
  },
]

export function SpecialOffers() {
  const { t } = useLanguage()

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t("specialOffers")}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't miss out on our amazing deals and special promotions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer) => {
            const IconComponent = offer.icon
            return (
              <Card
                key={offer.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-r ${offer.color} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <IconComponent className="w-8 h-8" />
                        <Badge className="bg-white/20 text-white border-white/30">{offer.discount} OFF</Badge>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                      <p className="text-white/90">{offer.description}</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">{offer.validUntil}</span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-full transition-all duration-300">
                      Claim Offer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

const foodImages = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqboUraTf-hVuGJyiB6337nXw8BhuU2kBQttJQCFHkhTtQnroM3lRDDCwrOy20hDEt5Ms&usqp=CAU",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqboUraTf-hVuGJyiB6337nXw8BhuU2kBQttJQCFHkhTtQnroM3lRDDCwrOy20hDEt5Ms&usqp=CAU",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqboUraTf-hVuGJyiB6337nXw8BhuU2kBQttJQCFHkhTtQnroM3lRDDCwrOy20hDEt5Ms&usqp=CAU",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqboUraTf-hVuGJyiB6337nXw8BhuU2kBQttJQCFHkhTtQnroM3lRDDCwrOy20hDEt5Ms&usqp=CAU",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqboUraTf-hVuGJyiB6337nXw8BhuU2kBQttJQCFHkhTtQnroM3lRDDCwrOy20hDEt5Ms&usqp=CAU",
]

export function Hero() {
  const { t } = useLanguage()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % foodImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating food images */}
        {foodImages.map((image, index) => (
          <div
            key={index}
            className={`absolute transition-all duration-1000 ${
              index === currentImageIndex ? "opacity-100 scale-110" : "opacity-30 scale-100"
            }`}
            style={{
              left: `${10 + index * 20}%`,
              top: `${20 + index * 15}%`,
              animationDelay: `${index * 0.5}s`,
            }}
          >
            <div className="animate-bounce">
              <img
                src={image || "/placeholder.svg"}
                alt={`Food ${index + 1}`}
                className="w-16 h-16 md:w-24 md:h-24 rounded-full shadow-lg object-cover"
              />
            </div>
          </div>
        ))}

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent animate-pulse">
              MILANO
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-gray-700">CAFE</p>
          </div>

          {/* Welcome Message */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight">{t("welcome")}</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the finest dining with our exquisite menu, crafted with love and served with passion. From
              gourmet burgers to authentic pizzas, every bite is a journey to flavor paradise.
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-700">4.9/5</span>
            <span className="text-gray-500">(2,847 reviews)</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/menu">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {t("ourMenu")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
              >
                {t("aboutUs")}
              </Button>
            </Link>
          </div>

          {/* Special Offers Banner */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full inline-block animate-bounce">
            <span className="font-bold">🎉 {t("specialOffers")}: 20% OFF on all pizzas today!</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}

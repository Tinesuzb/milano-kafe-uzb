"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                MILANO
              </div>
              <div className="text-sm text-gray-400 font-medium">CAFE</div>
            </div>
            <p className="text-gray-400">
              Experience the finest dining with our exquisite menu, crafted with love and served with passion.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-400 hover:text-orange-400 transition-colors">
                {t("home")}
              </Link>
              <Link href="/menu" className="block text-gray-400 hover:text-orange-400 transition-colors">
                {t("menu")}
              </Link>
              <Link href="/about" className="block text-gray-400 hover:text-orange-400 transition-colors">
                {t("about")}
              </Link>
              <Link href="/contact" className="block text-gray-400 hover:text-orange-400 transition-colors">
                {t("contact")}
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("contactUs")}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-orange-400" />
                <span className="text-gray-400">123 Milano Street, Tashkent, Uzbekistan</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-400" />
                <span className="text-gray-400">+998 90 123 45 67</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-400" />
                <span className="text-gray-400">info@milanocafe.uz</span>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("workingHours")}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">
                  {t("monday")} - {t("friday")}
                </span>
                <span className="text-white">9:00 - 22:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  {t("saturday")} - {t("sunday")}
                </span>
                <span className="text-white">10:00 - 23:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">© 2024 Milano Cafe. All rights reserved. Made with ❤️ in Uzbekistan</p>
        </div>
      </div>
    </footer>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ShoppingCart, User, Globe, Menu, X, Shield } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { LoginDialog } from "./login-dialog"
import { RegisterDialog } from "./register-dialog"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const { getTotalItems } = useCart()
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const router = useRouter()

  const navigation = [
    { name: t("home"), href: "/" },
    { name: t("menu"), href: "/menu" },
    { name: t("about"), href: "/about" },
    { name: t("contact"), href: "/contact" },
    { name: t("admin"), href: "/admin", icon: Shield },
  ]

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                MILANO
              </div>
              <div className="text-sm text-gray-600 font-medium">CAFE</div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors flex items-center"
                >
                  {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Globe className="h-4 w-4 mr-1" />
                    {language.toUpperCase()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLanguage("uz")}>O'zbek</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("ru")}>Русский</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Cart */}
              <Button variant="ghost" size="sm" className="relative" onClick={() => router.push("/cart")}>
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-600">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-1" />
                      {user.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => router.push("/profile")}>{t("profile")}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/orders")}>{t("myOrders")}</DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>{t("logout")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowLogin(true)}>
                    {t("login")}
                  </Button>
                  <Button size="sm" onClick={() => setShowRegister(true)} className="bg-orange-600 hover:bg-orange-700">
                    {t("register")}
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-orange-600 block px-3 py-3 text-base font-medium flex items-center rounded-md hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
      <RegisterDialog open={showRegister} onOpenChange={setShowRegister} />
    </>
  )
}

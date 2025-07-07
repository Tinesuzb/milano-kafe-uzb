import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { FeaturedMenu } from "@/components/featured-menu"
import { SpecialOffers } from "@/components/special-offers"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header />
      <Hero />
      <FeaturedMenu />
      <SpecialOffers />
      <Footer />
    </div>
  )
}

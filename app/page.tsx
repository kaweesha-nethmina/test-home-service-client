"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/Header"
import { ServiceCard } from "@/components/shared/ServiceCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { serviceService } from "@/services/serviceService"
import { categoryService } from "@/services/categoryService"
import type { Service, Category } from "@/types/api"
import { Search, Sparkles, Shield, Clock, Award } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesData, categoriesData] = await Promise.all([serviceService.getAll(), categoryService.getAll()])
        // Ensure servicesData is an array
        if (Array.isArray(servicesData)) {
          setServices(servicesData)
        } else {
          console.warn('Services data is not an array:', servicesData)
          setServices([])
        }
        
        // Ensure categoriesData is an array
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData)
        } else {
          console.warn('Categories data is not an array:', categoriesData)
          setCategories([])
        }
      } catch (error) {
        console.error("Failed to load data:", error)
        // Set empty arrays on error
        setServices([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Ensure services is always an array before filtering
  const filteredServices = (Array.isArray(services) ? services : []).filter(
    (service) =>
      service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const features = [
    {
      icon: Shield,
      title: "Verified Providers",
      description: "All service providers are thoroughly vetted and verified",
    },
    {
      icon: Clock,
      title: "Quick Booking",
      description: "Book services in minutes with our streamlined process",
    },
    {
      icon: Award,
      title: "Quality Guaranteed",
      description: "100% satisfaction guarantee on all services",
    },
    {
      icon: Sparkles,
      title: "Best Prices",
      description: "Competitive pricing with transparent quotes",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Find trusted <span className="text-primary">home service</span> providers
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Connect with verified professionals for all your home maintenance and improvement needs
            </p>
            <div className="flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for services..."
                  className="pl-10 h-12 bg-secondary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="lg" className="h-12 px-8">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
                <p className="text-muted-foreground">Find the perfect service for your needs</p>
              </div>
              <Link href="/categories">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category._id}
                  href={`/categories/${category._id}`}
                  className="p-6 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-secondary/50 transition-all text-center group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                    <span className="text-2xl">{category.icon || "🏠"}</span>
                  </div>
                  <h3 className="font-medium text-sm">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Popular Services</h2>
            <p className="text-muted-foreground">Highly rated services from trusted providers</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-secondary rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No services found</h3>
              <p className="text-muted-foreground">Try adjusting your search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.slice(0, 6).map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}

          {filteredServices.length > 6 && (
            <div className="text-center mt-12">
              <Button size="lg" variant="outline">
                View All Services
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of satisfied customers who trust HomeServe for their home service needs
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg">Create Account</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
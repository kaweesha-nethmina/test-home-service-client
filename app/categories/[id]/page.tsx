"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { categoryService } from "@/services/categoryService"
import { serviceService } from "@/services/serviceService"
import { providerService } from "@/services/providerService"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Star, Phone, User } from "lucide-react"
import type { Category, Service, User as UserType } from "@/types/api"
import { Header } from "@/components/layout/Header"
import api from "@/lib/api"

export default function CategoryDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [category, setCategory] = useState<Category | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [providers, setProviders] = useState<Record<string, UserType>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    try {
      const [categoryData, servicesData] = await Promise.all([
        categoryService.getById(id),
        serviceService.getByCategory(id),
      ])
      setCategory(categoryData as unknown as Category)
      setServices(servicesData as unknown as Service[])

      // Load provider information for each service
      const providerPromises = (servicesData as unknown as Service[]).map(async (service: Service) => {
        if (service.providerId) {
          try {
            const providerData = await providerService.getPublicProfile(service.providerId)
            return { serviceId: service._id, provider: providerData as unknown as UserType }
          } catch (error) {
            console.error(`Failed to load provider for service ${service._id}:`, error)
            return { serviceId: service._id, provider: null }
          }
        }
        return { serviceId: service._id, provider: null }
      })

      const providerResults = await Promise.all(providerPromises)
      const providerMap: Record<string, UserType> = {}
      
      providerResults.forEach(result => {
        if (result.provider) {
          providerMap[result.serviceId] = result.provider
        }
      })
      
      setProviders(providerMap)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Ensure image URLs include the backend URL if they're relative paths
  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Use the API base URL from the api instance
    const baseURL = api.defaults.baseURL || "http://localhost:5000";
    return `${baseURL}${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8" />
            <div className="h-12 bg-muted rounded w-1/2 mb-4" />
            <div className="h-6 bg-muted rounded w-3/4 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Header />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Category not found</h2>
          <Link href="/categories">
            <Button>Browse Categories</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Link href="/categories">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{category.icon || "📦"}</div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">{category.name}</h1>
              <p className="text-muted-foreground mt-2">{category.description}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Available Services ({services.length})</h2>
        </div>

        {services.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">No services available in this category yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const provider = providers[service._id]
              return (
                <Link key={service._id} href={`/services/${service._id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer h-full flex flex-col">
                    <div className="aspect-video bg-muted relative">
                      {service.images?.[0] ? (
                        <img
                          src={getImageUrl(service.images[0]) || "/placeholder.svg"}
                          alt={service.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          {category.icon || "🔧"}
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        ${service.price}
                      </Badge>
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{service.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-grow">{service.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{service.location || "Various locations"}</span>
                        </div>
                        
                        {provider && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="truncate">{provider.firstName} {provider.lastName}</span>
                          </div>
                        )}
                        
                        {provider?.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span className="truncate">{provider.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        {service.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{service.rating}</span>
                            <span className="text-xs text-muted-foreground">(124)</span>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">No ratings yet</div>
                        )}
                        <Button size="sm">View Details</Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
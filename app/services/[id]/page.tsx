"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { serviceService } from "@/services/serviceService"
import { providerService } from "@/services/providerService"
import type { Service, User } from "@/types/api"
import { ArrowLeft, Star, MapPin, Phone, Mail, Calendar, Clock, Award } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { ProviderList } from "@/components/service/ProviderList"
import { ServiceReviews } from "@/components/service/ServiceReviews"
import api from "@/lib/api"

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [service, setService] = useState<Service | null>(null)
  const [provider, setProvider] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // Mock data for multiple providers - in a real app this would come from the API
  const [providers] = useState<User[]>([])

  useEffect(() => {
    async function loadService() {
      try {
        const serviceData = await serviceService.getById(params.id as string)
        setService(serviceData as unknown as Service)

        if ((serviceData as unknown as Service).providerId) {
          const providerData = await providerService.getPublicProfile((serviceData as unknown as Service).providerId)
          setProvider(providerData as unknown as User)
        }
      } catch (error) {
        console.error("Failed to load service:", error)
      } finally {
        setLoading(false)
      }
    }
    loadService()
  }, [params.id])

  // Ensure image URLs include the backend URL if they're relative paths
  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Use the API base URL from the api instance
    const baseURL = api.defaults.baseURL || "http://localhost:5000";
    return `${baseURL}${imageUrl}`;
  };

  const handleBookNow = () => {
    if (!user) {
      router.push("/login")
      return
    }
    router.push(`/bookings/create?serviceId=${service?._id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary rounded w-1/4"></div>
            <div className="h-96 bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Service not found</h1>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link href={`/categories/${service?.categoryId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Category
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="aspect-video rounded-lg overflow-hidden bg-secondary relative">
              {service.images?.[0] ? (
                <img
                  src={getImageUrl(service.images[0]) || "/placeholder.svg"}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary">{service.name?.[0] || "S"}</span>
                  </div>
                </div>
              )}
              <Badge className="absolute top-4 left-4 text-lg py-2 px-3">
                ${service.price}
                <span className="text-xs font-normal ml-1">starting price</span>
              </Badge>
            </div>

            {/* Service Info */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{service.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-primary text-primary" />
                      <span className="font-medium">4.8</span>
                      <span>(124 reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-5 w-5" />
                      <span>Available nationwide</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-5 w-5" />
                      <span>24/7 Available</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  <Award className="h-5 w-5 mr-2" />
                  Verified Service
                </Badge>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed mt-6">
                {service.description}
              </p>
            </div>

            {/* Category Info */}
            {service.category && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    <span className="text-lg">{service.category.icon || "🏠"}</span>
                    <span className="font-medium">{service.category.name}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">{service.category.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Features/Benefits */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Service Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Professional service providers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Quality guarantee</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>24/7 customer support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Satisfaction guaranteed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Free consultation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Warranty included</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Provider List */}
            <ProviderList providers={providers} serviceId={service._id} />

            {/* Reviews */}
            <ServiceReviews />
          </div>

          <div className="space-y-6">
            <Card className="border-border/50 sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">${service.price}</div>
                  <p className="text-sm text-muted-foreground">Starting price</p>
                </div>

                <Button className="w-full" size="lg" onClick={handleBookNow}>
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Now
                </Button>

                {provider && (
                  <div className="pt-6 border-t border-border">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Service Provider
                    </h3>
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-semibold text-primary">
                          {provider.firstName?.[0]}
                          {provider.lastName?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg">
                          {provider.firstName} {provider.lastName}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-medium">4.9</span>
                          <span>(87 reviews)</span>
                        </div>
                        <Badge variant="outline" className="mt-2">Top Rated</Badge>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Phone className="h-5 w-5" />
                        <span>{provider.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Mail className="h-5 w-5" />
                        <span className="truncate">{provider.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <MapPin className="h-5 w-5" />
                        <span>Colombo, Sri Lanka</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/providers/${provider._id}`}>
                          View Full Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Stats */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Service Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">124</div>
                    <div className="text-sm text-muted-foreground">Bookings</div>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">98%</div>
                    <div className="text-sm text-muted-foreground">Completion</div>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">24h</div>
                    <div className="text-sm text-muted-foreground">Avg. Response</div>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">99%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
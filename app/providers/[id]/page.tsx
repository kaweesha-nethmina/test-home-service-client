"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { providerService } from "@/services/providerService"
import { Card } from "@/components/ui/card"
import { Star, MapPin, Phone, Mail, Briefcase, Award } from "lucide-react"
import type { User, Work } from "@/types/api"
import { Header } from "@/components/layout/Header"

export default function ProviderProfilePage() {
  const params = useParams()
  const [provider, setProvider] = useState<User | null>(null)
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProvider()
  }, [params.id])

  const loadProvider = async () => {
    try {
      const [profileData, worksData] = await Promise.all([
        providerService.getPublicProfile(params.id as string),
        providerService.getProviderWorks(params.id as string),
      ])
      setProvider(profileData)
      setWorks(worksData.works || worksData)
    } catch (error) {
      console.error("Failed to load provider:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted rounded-lg" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Header />
        <div className="text-center">
          <h2 className="text-2xl font-bold">Provider not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
                {provider.firstName?.[0]}
                {provider.lastName?.[0]}
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">
                  {provider.firstName} {provider.lastName}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Professional Service Provider</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Verified Provider</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < 4 ? "fill-accent text-accent" : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">4.8</span>
                  <span className="text-muted-foreground">(127 reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-muted-foreground leading-relaxed">
              Professional service provider with years of experience in delivering high-quality services. 
              Committed to customer satisfaction and excellence in every project.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span>{provider.email}</span>
              </div>
              {provider.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span>{provider.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>
          </Card>

          {works.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {works.map((work) => (
                  <Card key={work._id} className="overflow-hidden group">
                    {work.images && work.images[0] && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={work.images[0].startsWith('http') ? work.images[0] : `http://localhost:5000${work.images[0]}` || "/placeholder.svg"}
                          alt={work.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{work.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{work.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
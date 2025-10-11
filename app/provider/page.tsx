"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { providerService } from "@/services/providerService"
import { serviceService } from "@/services/serviceService"
import type { Work, Service } from "@/types/api"
import { Briefcase, HomeIcon, Star, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProviderDashboard() {
  const [works, setWorks] = useState<Work[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [worksResponse, servicesData] = await Promise.all([providerService.getServices(), serviceService.getAll()])
        // Extract works array from paginated response
        setWorks(worksResponse.works || worksResponse)
        setServices(servicesData)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    { name: "Total Services", value: services.length, icon: HomeIcon, color: "text-primary" },
    { name: "Portfolio Items", value: works.length, icon: Briefcase, color: "text-primary" },
    { name: "Average Rating", value: "4.8", icon: Star, color: "text-primary" },
    { name: "Total Bookings", value: "24", icon: TrendingUp, color: "text-primary" },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your business.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Portfolio</CardTitle>
              <Link href="/provider/works">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {works.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No portfolio items yet</p>
                <Link href="/provider/works/create">
                  <Button className="mt-4" size="sm">
                    Add your first work
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {works.slice(0, 3).map((work) => (
                  <div
                    key={work._id}
                    className="flex gap-4 p-3 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"
                  >
                    {work.images[0] && (
                      <img
                        src={work.images[0].startsWith('http') ? work.images[0] : `http://localhost:5000${work.images[0]}` || "/placeholder.svg"}
                        alt={work.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{work.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{work.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/provider/works/create">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Briefcase className="mr-2 h-4 w-4" />
                Add Portfolio Item
              </Button>
            </Link>
            <Link href="/provider/services">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <HomeIcon className="mr-2 h-4 w-4" />
                Manage Services
              </Button>
            </Link>
            <Link href="/provider/profile">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Star className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
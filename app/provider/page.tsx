"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { providerService } from "@/services/providerService"
import { serviceService } from "@/services/serviceService"
import { bookingService } from "@/services/bookingService"
import type { Service, Booking } from "@/types/api"
import { 
  HomeIcon, 
  Star, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

export default function ProviderDashboard() {
  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesData, bookingsData] = await Promise.all([
          serviceService.getAll(),
          providerService.getBookings()
        ])
        setServices(servicesData)
        setBookings(bookingsData)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Prepare data for charts
  const bookingStats = [
    { 
      name: "Total", 
      value: bookings.length, 
      icon: Calendar, 
      color: "text-primary" 
    },
    { 
      name: "Pending", 
      value: bookings.filter(b => b.status === "pending").length, 
      icon: Clock, 
      color: "text-yellow-500" 
    },
    { 
      name: "Accepted", 
      value: bookings.filter(b => b.status === "accepted").length, 
      icon: CheckCircle, 
      color: "text-blue-500" 
    },
    { 
      name: "Completed", 
      value: bookings.filter(b => b.status === "completed").length, 
      icon: CheckCircle, 
      color: "text-green-500" 
    },
  ]

  // Prepare data for monthly bookings chart
  const monthlyBookingsData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()
    const data = []
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.date)
        return bookingDate.getMonth() === monthIndex && 
               bookingDate.getFullYear() === new Date().getFullYear()
      })
      
      data.push({
        name: months[monthIndex],
        bookings: monthBookings.length
      })
    }
    
    return data
  }

  // Prepare data for booking status pie chart
  const bookingStatusData = [
    { name: "Pending", value: bookings.filter(b => b.status === "pending").length },
    { name: "Accepted", value: bookings.filter(b => b.status === "accepted").length },
    { name: "Completed", value: bookings.filter(b => b.status === "completed").length },
    { name: "Rejected", value: bookings.filter(b => b.status === "rejected").length },
    { name: "Cancelled", value: bookings.filter(b => b.status === "cancelled").length },
  ]

  const COLORS = ["#FFBB28", "#0088FE", "#00C49F", "#FF8042", "#8884d8"]

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
          <div className="h-80 bg-secondary rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your business.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {bookingStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Bookings Overview (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBookingsData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Link href="/provider/bookings">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No bookings yet</p>
                <Link href="/provider/services">
                  <Button className="mt-4" size="sm">
                    View your services
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking._id}
                    className="flex gap-4 p-3 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {typeof booking.service !== 'string' ? booking.service?.name : "Service"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.customer?.firstName} {booking.customer?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.date).toLocaleDateString()} at {new Date(booking.date).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        booking.status === "accepted" ? "bg-blue-100 text-blue-800" :
                        booking.status === "completed" ? "bg-green-100 text-green-800" :
                        booking.status === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {booking.status}
                      </span>
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
            <Link href="/provider/services">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <HomeIcon className="mr-2 h-4 w-4" />
                Manage Services
              </Button>
            </Link>
            <Link href="/provider/bookings">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                View All Bookings
              </Button>
            </Link>
            <Link href="/provider/feedback">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Star className="mr-2 h-4 w-4" />
                View Feedback
              </Button>
            </Link>
            <Link href="/provider/profile">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { bookingService } from "@/services/bookingService"
import { serviceService } from "@/services/serviceService"
import { useToast } from "@/hooks/use-toast"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { useAuth } from "@/hooks/useAuth"
import { ArrowLeft, Loader2, Calendar, User, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import type { Service } from "@/types/api"
import api from "@/lib/api"

export default function CreateBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  // Specify that only customers can access this page
  const { isLoading: authLoading, user: authUser } = useRequireAuth({ roles: ["customer"] })
  const { user } = useAuth()

  const [service, setService] = useState<Service | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [address, setAddress] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const serviceId = searchParams.get("serviceId")

  useEffect(() => {
    console.log("Auth state:", { authUser, authLoading, user })
    // Pre-fill customer name and phone from user data
    if (user) {
      setCustomerName(`${user.firstName} ${user.lastName}`)
      setCustomerPhone(user.phone || "")
    }
  }, [user, authUser, authLoading])

  useEffect(() => {
    async function loadService() {
      if (!serviceId) {
        setError("No service specified")
        router.push("/")
        return
      }

      console.log("Attempting to load service with ID:", serviceId)
      try {
        const serviceData = await serviceService.getById(serviceId);
        
        console.log("Service data received:", serviceData)
        setService(serviceData as unknown as Service)
        setError(null)
      } catch (error: any) {
        console.error("Failed to load service:", error)
        setError(`Failed to load service: ${error.message || error}`)
        toast({
          title: "Service not found",
          description: "The requested service could not be found",
          variant: "destructive",
        })
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    // Only load service if auth is not loading and user is authenticated
    if (!authLoading && !authUser) {
      // User is not authenticated, redirect to login
      console.log("User not authenticated, redirecting to login")
      router.push("/login")
      return
    }
    
    if (!authLoading && authUser) {
      // Check if user has customer role
      if (authUser.role !== "customer") {
        console.log("User does not have customer role, redirecting. User role:", authUser.role)
        toast({
          title: "Access Denied",
          description: "Only customers can book services",
          variant: "destructive",
        })
        // Redirect based on user role
        if (authUser.role === "provider") {
          router.push("/provider")
        } else if (authUser.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/")
        }
        return
      }
      
      loadService()
    }
  }, [serviceId, authLoading, authUser, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!serviceId) return

    if (!address.trim()) {
      toast({
        title: "Address required",
        description: "Please enter your address",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await bookingService.create({
        serviceId,
        date: scheduledDate,
        address,
        notes,
        customerName,
        customerPhone,
      })

      toast({
        title: "Booking created!",
        description: "Your service has been booked successfully",
      })

      router.push("/bookings")
    } catch (error: any) {
      console.error("Booking error:", error)
      toast({
        title: "Booking failed",
        description: error.response?.data?.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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

  // Show loading state while checking auth or loading service
  if (authLoading || loading) {
    console.log("Showing loading state:", { authLoading, loading })
    return (
      <div className="min-h-screen bg-background">
        <div>Loading...</div>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary rounded w-1/4"></div>
            <div className="h-96 bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Show error if there's an error
  if (error) {
    console.log("Showing error state:", error)
    return (
      <div className="min-h-screen bg-background">
        <div>Error: {error}</div>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Show service not found if no service loaded
  if (!service) {
    console.log("Showing service not found state")
    return (
      <div className="min-h-screen bg-background">
        <div>Service not found</div>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Service not found</h1>
          <p className="text-muted-foreground mb-6">The requested service could not be found</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div>Booking page rendered</div>
      <div>Service ID: {serviceId}</div>
      <div>Service: {service ? "Loaded" : "Not loaded"}</div>
      <div>Loading: {loading ? "true" : "false"}</div>
      <div>Auth Loading: {authLoading ? "true" : "false"}</div>
      <div>User Role: {user?.role || "Unknown"}</div>
      <div>Auth User Role: {authUser?.role || "Unknown"}</div>
      <div>Error: {error || "None"}</div>
      
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href={`/services/${serviceId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Service
          </Button>
        </Link>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Book Service</h1>
            <p className="text-muted-foreground">Schedule your appointment for {service.name}</p>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                {service.images?.[0] && (
                  <img
                    src={getImageUrl(service.images[0]) || "/placeholder.svg"}
                    alt={service.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                  <p className="text-lg font-bold text-primary mt-2">${service.price}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="pl-10 bg-secondary/50"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="pl-10 bg-secondary/50"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="pl-10 bg-secondary/50"
                    placeholder="Enter your full address"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Preferred Date & Time</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                    className="bg-secondary/50"
                  />
                  <p className="text-sm text-muted-foreground">Select your preferred appointment time</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific requirements or details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="bg-secondary/50"
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                  <Link href={`/services/${serviceId}`}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { bookingService } from "@/services/bookingService"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, MapPin, User, Phone, Mail, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Booking } from "@/types/api"
import { Header } from "@/components/layout/Header"

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadBooking()
  }, [params.id])

  const loadBooking = async () => {
    try {
      const data = await bookingService.getById(params.id as string)
      setBooking(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status: string) => {
    if (!booking) return
    setUpdating(true)
    try {
      await bookingService.updateStatus(booking._id, status)
      toast({
        title: "Success",
        description: "Booking status updated successfully",
      })
      loadBooking()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = async () => {
    if (!booking || !confirm("Are you sure you want to cancel this booking?")) return
    setUpdating(true)
    try {
      await bookingService.delete(booking._id)
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      })
      router.push("/bookings")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      })
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-success/10 text-success border-success/20"
      case "pending":
        return "bg-warning/10 text-warning border-warning/20"
      case "completed":
        return "bg-primary/10 text-primary border-primary/20"
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Header />
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Booking not found</h2>
          <Button onClick={() => router.push("/bookings")}>Go to Bookings</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Booking Details</h1>
              <p className="text-muted-foreground">Booking ID: {booking._id}</p>
            </div>
            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Service Information</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium">
                    {typeof booking.service === 'string' ? "Service" : (booking.service?.name || "N/A")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(booking.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{new Date(booking.date).toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{booking.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium text-lg">${booking.totalPrice}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <span>
                  {booking.customerName}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span>{booking.customerPhone}</span>
              </div>
            </div>
          </Card>

          {booking.notes && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
              <p className="text-muted-foreground">{booking.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
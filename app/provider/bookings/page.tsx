"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Check, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import type { Booking } from "@/types/api"
import { providerService } from "@/services/providerService"

export default function ProviderBookingsPage() {
  const { isLoading: authLoading } = useRequireAuth({ roles: ["provider"] })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading) {
      loadBookings()
    }
  }, [authLoading])

  async function loadBookings() {
    try {
      const data = await providerService.getBookings()
      setBookings(data)
    } catch (error) {
      toast({
        title: "Failed to load bookings",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function updateBookingStatus(bookingId: string, status: string) {
    try {
      setUpdatingId(bookingId)
      const response = await providerService.updateBookingStatus(bookingId, status)
      
      // Update the booking in the state
      const updatedBooking = response.data || response
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? { ...booking, status: updatedBooking.status } : booking
      ))
      
      toast({
        title: "Booking updated",
        description: `Booking status updated to ${status}`,
      })
    } catch (error) {
      toast({
        title: "Failed to update booking",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-primary/10 text-primary border-primary/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  if (authLoading || loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground">Manage your service appointments</p>
      </div>

      {bookings.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              You don't have any bookings at the moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking._id} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {typeof booking.service !== 'string' ? booking.service?.name : "Service"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Customer: {booking.customer?.firstName} {booking.customer?.lastName}
                        </p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(booking.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(booking.date).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <p className="font-medium">Customer Contact:</p>
                      <p className="text-muted-foreground">{booking.customerName} ({booking.customerPhone})</p>
                      <p className="text-muted-foreground">{booking.address}</p>
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded">
                        <span className="font-medium">Notes:</span> {booking.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {booking.status === "pending" && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => updateBookingStatus(booking._id, "accepted")}
                          disabled={updatingId === booking._id}
                        >
                          {updatingId === booking._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateBookingStatus(booking._id, "rejected")}
                          disabled={updatingId === booking._id}
                        >
                          {updatingId === booking._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </>
                    )}
                    {booking.status === "accepted" && (
                      <Button 
                        size="sm" 
                        onClick={() => updateBookingStatus(booking._id, "completed")}
                        disabled={updatingId === booking._id}
                      >
                        {updatingId === booking._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
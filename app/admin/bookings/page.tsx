"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { adminService } from "@/services/adminService"
import { serviceService } from "@/services/serviceService"
import type { Booking, Service } from "@/types/api"
import { Calendar, Clock, DollarSign, Phone, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [serviceImages, setServiceImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadBookings()
  }, [])

  async function loadBookings() {
    try {
      const data = await adminService.getAllBookings()
      // Ensure data is an array
      if (Array.isArray(data)) {
        setBookings(data)
        // Load service images for all bookings
        await loadServiceImages(data)
      } else if (data && Array.isArray(data.data)) {
        // If data is an object with a data array property
        setBookings(data.data)
        // Load service images for all bookings
        await loadServiceImages(data.data)
      } else {
        // Fallback to empty array if data format is unexpected
        console.warn('Unexpected data format received:', data)
        setBookings([])
      }
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

  async function loadServiceImages(bookings: Booking[]) {
    const imageLoadPromises = bookings.map((booking: Booking) => {
      return loadServiceImage(booking).catch(error => {
        console.error("Error loading image for booking:", booking._id, error);
      });
    });
    
    await Promise.all(imageLoadPromises);
  }

  async function loadServiceImage(booking: Booking) {
    const serviceId = typeof booking.service === 'string' ? booking.service : booking.service?._id;
    
    if (serviceId) {
      // Check if we already have this image
      if (serviceImages[serviceId]) {
        return;
      }
      
      try {
        const serviceData = await serviceService.getById(serviceId);
        if (serviceData?.images?.[0]) {
          const imageUrl = serviceData.images[0];
          const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`;
          setServiceImages(prev => ({
            ...prev,
            [serviceId]: fullImageUrl
          }));
        }
      } catch (error) {
        console.error("Failed to load service image for service ID:", serviceId, error);
      }
    }
  }

  async function handleStatusChange(bookingId: string, newStatus: string) {
    try {
      await adminService.updateBookingStatus(bookingId, newStatus)
      setBookings(bookings.map((b) => (b._id === bookingId ? { ...b, status: newStatus as any } : b)))
      toast({ title: "Status updated", description: "Booking status has been changed" })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update booking status",
        variant: "destructive",
      })
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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
        <h1 className="text-3xl font-bold mb-2">Bookings Management</h1>
        <p className="text-muted-foreground">Manage all bookings on the platform</p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => {
          // Get service ID - it could be a string or a Service object
          const serviceId = typeof booking.service === 'string' ? booking.service : booking.service?._id;
          
          return (
            <Card key={booking._id} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {/* Service Image */}
                        {(() => {
                          const serviceId = typeof booking.service === 'string' ? booking.service : booking.service?._id;
                          const directImage = typeof booking.service !== 'string' && booking.service?.images?.[0];
                          const fetchedImage = serviceId ? serviceImages[serviceId] : null;
                          
                          let imageSrc = null;
                          if (fetchedImage) {
                            imageSrc = fetchedImage;
                          } else if (directImage) {
                            imageSrc = directImage.startsWith('http') ? directImage : `http://localhost:5000${directImage}`;
                          }
                          
                          if (imageSrc) {
                            return (
                              <img
                                src={imageSrc}
                                alt={typeof booking.service !== 'string' ? booking.service?.name : "Service"}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                            );
                          }
                          
                          return (
                            <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No Image</span>
                            </div>
                          );
                        })()}
                        
                        <div>
                          <h3 className="font-semibold text-lg">
                            {typeof booking.service === 'string' 
                              ? booking.serviceName || "Service" 
                              : booking.service?.name || "Service"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Customer: {booking.customer?.firstName ? `${booking.customer.firstName} ${booking.customer.lastName}` : booking.customer?.name || booking.customerName || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Provider: {booking.provider?.firstName ? `${booking.provider.firstName} ${booking.provider.lastName}` : booking.provider?.name || booking.providerName || 'N/A'}
                          </p>
                        </div>
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
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>${booking.totalPrice}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{booking.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{booking.customerPhone}</span>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded">
                        <span className="font-medium">Notes:</span> {booking.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Select value={booking.status} onValueChange={(value) => handleStatusChange(booking._id, value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {bookings.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground">Bookings will appear here once created</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
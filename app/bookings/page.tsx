"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { bookingService } from "@/services/bookingService"
import { serviceService } from "@/services/serviceService"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import type { Booking, Service } from "@/types/api"
import { Calendar, Clock, X, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import api from "@/lib/api"
import { FeedbackModal } from "@/components/shared/FeedbackModal"

export default function BookingsPage() {
  const { isLoading: authLoading } = useRequireAuth({ roles: ["customer"] })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [serviceImages, setServiceImages] = useState<Record<string, string>>({})
  const [feedbackBooking, setFeedbackBooking] = useState<Booking | null>(null)
  
  useEffect(() => {
    if (!authLoading) {
      loadBookings();
    }
  }, [authLoading]);

  // Add effect to log when bookings change
  useEffect(() => {
    console.log("Bookings updated:", bookings.length);
  }, [bookings]);
  
  // Add effect to log serviceImages changes
  useEffect(() => {
    console.log("Service images count:", Object.keys(serviceImages).length);
  }, [serviceImages]);
  const [loading, setLoading] = useState(true)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const { toast } = useToast()

  async function loadBookings() {
    try {
      const data = await bookingService.getAll()
      // Ensure data is an array before setting it
      const bookingsArray = Array.isArray(data) ? data : []
      setBookings(bookingsArray)
      
      // Fetch service images for each booking
      const imageLoadPromises = bookingsArray.map((booking: Booking) => {
        return loadServiceImage(booking).catch(error => {
          console.error("Error loading image for booking:", booking._id, error);
        });
      });
      
      await Promise.all(imageLoadPromises);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      toast({
        title: "Failed to load bookings",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
        const imageUrl = (serviceData as unknown as Service)?.images?.[0];
        if (imageUrl) {
          // Ensure image URLs include the backend URL if they're relative paths
          const getImageUrl = (imageUrl: string) => {
            if (imageUrl.startsWith('http')) {
              return imageUrl;
            }
            // Use the API base URL from the api instance
            const baseURL = api.defaults.baseURL || "http://localhost:5000";
            return `${baseURL}${imageUrl}`;
          };
          const fullImageUrl = getImageUrl(imageUrl);
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

  async function handleCancel() {
    if (!cancelId) return

    try {
      await bookingService.delete(cancelId)
      setBookings(bookings.filter((b) => b._id !== cancelId))
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled",
      })
    } catch (error) {
      toast({
        title: "Cancellation failed",
        description: "Failed to cancel booking",
        variant: "destructive",
      })
    } finally {
      setCancelId(null)
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-secondary rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your service appointments</p>
        </div>

        {(bookings || []).length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Start booking services to see your appointments here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {(bookings || []).map((booking) => {
              // Get service ID - it could be a string or a Service object
              const serviceId = typeof booking.service === 'string' ? booking.service : booking.service?._id;
              
              return (
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
                              Provider: {booking.provider?.firstName} {booking.provider?.lastName}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        </div>

                        {/* Service Image */}
                        {(() => {
                          const serviceId = typeof booking.service === 'string' ? booking.service : booking.service?._id;
                          const directImage = typeof booking.service !== 'string' && (booking.service as Service)?.images?.[0];
                          const fetchedImage = serviceId ? serviceImages[serviceId] : null;
                          
                          let imageSrc = null;
                          if (fetchedImage) {
                            imageSrc = fetchedImage;
                          } else if (directImage) {
                            // Ensure image URLs include the backend URL if they're relative paths
                            const getImageUrl = (imageUrl: string) => {
                              if (imageUrl.startsWith('http')) {
                                return imageUrl;
                              }
                              // Use the API base URL from the api instance
                              const baseURL = api.defaults.baseURL || "http://localhost:5000";
                              return `${baseURL}${imageUrl}`;
                            };
                            imageSrc = getImageUrl(directImage);
                          }
                          
                          if (imageSrc) {
                            return (
                              <div className="flex items-center gap-4">
                                <img
                                  src={imageSrc}
                                  alt={typeof booking.service !== 'string' ? booking.service?.name : "Service"}
                                  className="w-16 h-16 object-cover rounded-lg"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/placeholder.svg";
                                  }}
                                />
                              </div>
                            );
                          }
                          
                          return (
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">No Image</span>
                              </div>
                            </div>
                          );
                        })()}

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

                        {booking.notes && (
                          <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded">
                            <span className="font-medium">Notes:</span> {booking.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {booking.status === "pending" && (
                          <Button variant="outline" size="sm" onClick={() => setCancelId(booking._id)}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        )}
                        {booking.status === "completed" && (
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setFeedbackBooking(booking);
                            }}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Submit Feedback
                          </Button>
                        )}
                      </div>
                      
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel booking?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently cancel your booking.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground">
                Cancel Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {feedbackBooking && (
          <FeedbackModal
            open={!!feedbackBooking}
            onOpenChange={(open) => !open && setFeedbackBooking(null)}
            booking={feedbackBooking}
            onSubmit={loadBookings}
          />
        )}
      </div>
    </div>
  )
}
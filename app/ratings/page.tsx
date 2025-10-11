"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supportService } from "@/services/supportService"
import { bookingService } from "@/services/bookingService"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import type { Booking } from "@/types/api"
import { Header } from "@/components/layout/Header"

export default function RatingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const data = await bookingService.getAll()
      // Filter completed bookings that haven't been rated
      const completedBookings = data.filter((b: Booking) => b.status === "completed" && !b.rated)
      setBookings(completedBookings)
    } catch (error) {
      console.error("Failed to load bookings:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking || rating === 0) return

    setLoading(true)
    try {
      // Get the service ID from the booking
      const serviceId = typeof selectedBooking.service === 'string' 
        ? selectedBooking.service 
        : selectedBooking.service?._id;
      
      if (!serviceId) {
        throw new Error("Service ID not found in booking");
      }
      
      await supportService.submitRating({
        serviceId: serviceId,
        rating,
        comment,
      })
      alert("Rating submitted successfully!")
      setSelectedBooking(null)
      setRating(0)
      setComment("")
      loadBookings()
    } catch (error) {
      console.error("Failed to submit rating:", error)
      alert("Failed to submit rating")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Rate Services</h1>
          <p className="text-muted-foreground">Share your experience with completed services</p>
        </div>

        {!selectedBooking ? (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">No completed services to rate at the moment</p>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{booking.serviceName || "Service"}</h3>
                      <p className="text-sm text-muted-foreground">
                        Completed on {new Date(booking.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Provider: {booking.providerName || "Unknown"}</p>
                    </div>
                    <Button onClick={() => setSelectedBooking(booking)}>Rate Service</Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Rate: {selectedBooking.serviceName}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="mb-3 block">Your Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="comment">Your Review (Optional)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this service..."
                  rows={5}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading || rating === 0} className="flex-1">
                  {loading ? "Submitting..." : "Submit Rating"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedBooking(null)
                    setRating(0)
                    setComment("")
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
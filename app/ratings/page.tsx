"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supportService } from "@/services/supportService"
import { bookingService } from "@/services/bookingService"
import { feedbackService } from "@/services/feedbackService"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Star } from "lucide-react"
import type { Booking, Feedback } from "@/types/api"
import { Header } from "@/components/layout/Header"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function RatingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadBookings()
    loadFeedbacks()
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

  const loadFeedbacks = async () => {
    try {
      const data = await feedbackService.getCustomerFeedback()
      setFeedbacks(data.data || data)
    } catch (error) {
      console.error("Failed to load feedbacks:", error)
    }
  }

  const handleRatingSubmit = async (e: React.FormEvent) => {
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
      toast({
        title: "Rating submitted",
        description: "Your rating has been submitted successfully!"
      })
      setSelectedBooking(null)
      setRating(0)
      setComment("")
      loadBookings()
    } catch (error) {
      console.error("Failed to submit rating:", error)
      toast({
        title: "Submission failed",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFeedback || rating === 0) return

    setLoading(true)
    try {
      await feedbackService.updateFeedback(selectedFeedback._id, {
        rating,
        title,
        comment,
        isPublic
      })
      toast({
        title: "Feedback updated",
        description: "Your feedback has been updated successfully!"
      })
      setSelectedFeedback(null)
      setRating(0)
      setTitle("")
      setComment("")
      setIsPublic(true)
      loadFeedbacks()
      setFeedbackModalOpen(false)
    } catch (error) {
      console.error("Failed to update feedback:", error)
      toast({
        title: "Update failed",
        description: "Failed to update feedback. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      await feedbackService.deleteFeedback(feedbackId)
      toast({
        title: "Feedback deleted",
        description: "Your feedback has been deleted successfully!"
      })
      loadFeedbacks()
    } catch (error) {
      console.error("Failed to delete feedback:", error)
      toast({
        title: "Deletion failed",
        description: "Failed to delete feedback. Please try again.",
        variant: "destructive"
      })
    }
  }

  const openFeedbackModal = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setRating(feedback.rating)
    setTitle(feedback.title)
    setComment(feedback.comment || "")
    setIsPublic(feedback.isPublic)
    setFeedbackModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Rate Services & Feedback</h1>
          <p className="text-muted-foreground">Share your experience with completed services</p>
        </div>

        {!selectedBooking && !feedbackModalOpen ? (
          <div className="space-y-8">
            {/* Rating Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Rate Completed Services</h2>
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
            </div>

            {/* Feedback Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">My Feedback</h2>
              <div className="space-y-4">
                {feedbacks.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground text-lg">No feedback submitted yet</p>
                  </Card>
                ) : (
                  feedbacks.map((feedback) => (
                    <Card key={feedback._id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground mb-2">{feedback.title}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                              />
                            ))}
                            <span className="text-sm text-muted-foreground">
                              {new Date(feedback.createdAt || "").toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{feedback.comment}</p>
                          <p className="text-sm text-muted-foreground">
                            Service: {typeof feedback.service !== 'string' ? feedback.service?.name : "Service"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Provider: {feedback.provider?.firstName} {feedback.provider?.lastName}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => openFeedbackModal(feedback)}>
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteFeedback(feedback._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : selectedBooking ? (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Rate: {selectedBooking.serviceName}</h2>

            <form onSubmit={handleRatingSubmit} className="space-y-6">
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
        ) : (
          <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Feedback</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <Label className="mb-3 block">Rating</Label>
                  <div className="flex gap-1">
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
                          className={`h-8 w-8 ${
                            star <= (hoveredRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of your experience"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="comment">Comment</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your detailed experience..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isPublic" className="text-sm font-medium">
                    Make this feedback public
                  </Label>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Updating..." : "Update Feedback"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFeedbackModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Star } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { feedbackService } from "@/services/feedbackService"
import { useToast } from "@/hooks/use-toast"

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: any
  onSubmit: () => void
}

export function FeedbackModal({ open, onOpenChange, booking, onSubmit }: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Debugging: Log the booking object to see its structure
  useEffect(() => {
    if (booking) {
      console.log("FeedbackModal booking object:", booking)
    }
  }, [booking])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide a rating",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Extract serviceId - it could be a string or an object
      const serviceId = typeof booking.service === 'string' 
        ? booking.service 
        : booking.service?._id || booking.serviceId

      // Extract providerId - it could be a string or an object
      const providerId = typeof booking.provider === 'string'
        ? booking.provider
        : booking.provider?._id || booking.providerId

      // Validate required fields
      if (!providerId || !serviceId || !booking._id) {
        toast({
          title: "Missing information",
          description: `Missing required fields: providerId=${!!providerId}, serviceId=${!!serviceId}, bookingId=${!!booking._id}`,
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      // Validate data format
      if (!providerId.match(/^[0-9a-fA-F]{24}$/)) {
        toast({
          title: "Invalid provider ID",
          description: "Provider ID format is invalid",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      if (!serviceId.match(/^[0-9a-fA-F]{24}$/)) {
        toast({
          title: "Invalid service ID",
          description: "Service ID format is invalid",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      if (!booking._id.match(/^[0-9a-fA-F]{24}$/)) {
        toast({
          title: "Invalid booking ID",
          description: "Booking ID format is invalid",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      console.log("Submitting feedback with validated data:", {
        providerId,
        serviceId,
        bookingId: booking._id,
        rating,
        title,
        comment,
        isPublic
      })

      await feedbackService.submitFeedback({
        providerId,
        serviceId,
        bookingId: booking._id,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        isPublic
      })

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!"
      })

      // Reset form
      setRating(0)
      setTitle("")
      setComment("")
      setIsPublic(true)
      
      // Close modal and refresh data
      onOpenChange(false)
      onSubmit()
    } catch (error: any) {
      console.error("Feedback submission error:", error)
      toast({
        title: "Submission failed",
        description: error.message || error.response?.data?.message || "Failed to submit feedback. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
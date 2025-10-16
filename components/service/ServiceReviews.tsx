"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { feedbackService } from "@/services/feedbackService"
import type { Feedback } from "@/types/api"

interface ServiceReviewsProps {
  serviceId?: string
  providerId?: string
}

export function ServiceReviews({ serviceId, providerId }: ServiceReviewsProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFeedbacks() {
      try {
        let data: any[] = [];
        
        // If we have a serviceId, fetch feedback for that service (preferred)
        if (serviceId) {
          const response = await feedbackService.getServiceFeedback(serviceId)
          data = response.data || response
        }
        // Fallback to provider feedback if serviceId is not available
        else if (providerId) {
          const response = await feedbackService.getPublicFeedback(providerId)
          data = response.data || response
        }
        
        // Show all feedbacks regardless of status
        setFeedbacks(data)
      } catch (error) {
        console.error("Failed to load feedback:", error)
      } finally {
        setLoading(false)
      }
    }

    if (serviceId || providerId) {
      loadFeedbacks()
    } else {
      setLoading(false)
    }
  }, [serviceId, providerId])

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary rounded w-1/4"></div>
                  <div className="h-3 bg-secondary rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show all feedbacks without filtering by status
  const allFeedbacks = feedbacks

  if (allFeedbacks.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No reviews yet. Be the first to review this service!
          </div>
        </CardContent>
      </Card>
    )
  }

  const averageRating = allFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / allFeedbacks.length

  // Helper function to get customer name
  const getCustomerName = (customer: any): string => {
    if (typeof customer === 'string') {
      return 'Customer'
    }
    if (customer?.name) {
      return customer.name
    }
    if (customer?.firstName || customer?.lastName) {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
    }
    return 'Customer'
  }

  // Helper function to get customer initials
  const getCustomerInitials = (customer: any): string => {
    const name = getCustomerName(customer)
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Customer Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(averageRating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{allFeedbacks.length} reviews</div>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = allFeedbacks.filter(r => r.rating === stars).length
              const percentage = allFeedbacks.length > 0 ? (count / allFeedbacks.length) * 100 : 0
              return (
                <div key={stars} className="flex items-center gap-2 mb-1">
                  <span className="text-sm w-4">{stars}</span>
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          {allFeedbacks.map((feedback) => (
            <div key={feedback._id} className="border-b border-border pb-6 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>
                    {getCustomerInitials(feedback.customer)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {getCustomerName(feedback.customer)}
                    </h4>
                    <span className="text-sm text-muted-foreground">
                      {new Date(feedback.createdAt || "").toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < feedback.rating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-2">
                    <h5 className="font-medium">{feedback.title}</h5>
                    <p className="text-muted-foreground">{feedback.comment}</p>
                    {feedback.status && feedback.status !== "approved" && (
                      <Badge variant="secondary" className="mt-2">
                        {feedback.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
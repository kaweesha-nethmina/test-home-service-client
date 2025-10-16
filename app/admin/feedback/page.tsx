"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MessageCircle, RefreshCw } from "lucide-react"
import { adminService } from "@/services/adminService"
import type { Feedback } from "@/types/api"
import { useToast } from "@/hooks/use-toast"
import { useRequireAuth } from "@/hooks/useRequireAuth"

export default function AdminFeedbackPage() {
  const { isLoading: authLoading } = useRequireAuth({ roles: ["admin"] })
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading) {
      loadFeedbacks()
    }
  }, [authLoading])

  async function loadFeedbacks() {
    try {
      const data = await adminService.getAllFeedbacks()
      setFeedbacks(Array.isArray(data) ? data : data.data || [])
    } catch (error: any) {
      console.error("Error loading feedbacks:", error)
      toast({
        title: "Failed to load feedback",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const data = await adminService.getAllFeedbacks()
      setFeedbacks(Array.isArray(data) ? data : data.data || [])
      toast({
        title: "Feedback refreshed",
        description: "Feedback data has been updated",
      })
    } catch (error: any) {
      toast({
        title: "Failed to refresh feedback",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  async function handleStatusChange(feedbackId: string, newStatus: string) {
    try {
      const response = await adminService.updateFeedback(feedbackId, { status: newStatus as "pending" | "approved" | "rejected" | "completed" })
      const updatedFeedback = response.data || response
      setFeedbacks(feedbacks.map((f) => (f._id === feedbackId ? updatedFeedback : f)))
      toast({ title: "Status updated", description: "Feedback status has been changed" })
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.response?.data?.message || "Failed to update feedback status",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
          />
        ))}
      </div>
    )
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customer Feedback</h1>
          <p className="text-muted-foreground">Manage all customer feedback and reviews</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {feedbacks.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No feedback yet</h3>
            <p className="text-muted-foreground">Customers haven't submitted any feedback yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <Card key={feedback._id} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{feedback.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(feedback.rating)}
                          <span className="text-sm text-muted-foreground">
                            by {feedback.customer?.firstName} {feedback.customer?.lastName}
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(feedback.status)}>{feedback.status}</Badge>
                    </div>

                    <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded">
                      {feedback.comment}
                    </p>

                    <div className="text-sm text-muted-foreground">
                      <p>
                        Service: {typeof feedback.service !== 'string' ? feedback.service?.name : "Service"}
                      </p>
                      <p>
                        Provider: {feedback.provider?.firstName} {feedback.provider?.lastName}
                      </p>
                      <p className="mt-1">
                        Submitted: {new Date(feedback.createdAt || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Select 
                      value={feedback.status} 
                      onValueChange={(value) => handleStatusChange(feedback._id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
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
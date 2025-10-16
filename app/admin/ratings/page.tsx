"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { adminService } from "@/services/adminService"
import type { Rating } from "@/types/api"
import { useToast } from "@/hooks/use-toast"
import { useRequireAuth } from "@/hooks/useRequireAuth"

export default function AdminRatingsPage() {
  const { isLoading: authLoading } = useRequireAuth({ roles: ["admin"] })
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading) {
      loadRatings()
    }
  }, [authLoading])

  async function loadRatings() {
    try {
      const data = await adminService.getAllRatings()
      // For now, we'll show a message that this feature requires backend implementation
      toast({
        title: "Feature not implemented",
        description: "This feature requires backend implementation",
        variant: "destructive",
      })
    } catch (error) {
      toast({
        title: "Failed to load ratings",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Customer Ratings</h1>
        <p className="text-muted-foreground">View all customer ratings and feedback</p>
      </div>

      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Star className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ratings Management</h3>
          <p className="text-muted-foreground text-center mb-4">
            This feature requires backend implementation to fetch all ratings across the platform.
          </p>
          <p className="text-sm text-muted-foreground">
            Backend endpoint needed: GET /api/admin/ratings
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supportService } from "@/services/supportService"
import type { Complaint } from "@/types/api"
import { AlertCircle, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRequireAuth } from "@/hooks/useRequireAuth"

export default function ProviderSupportPage() {
  const { isLoading: authLoading } = useRequireAuth({ roles: ["provider"] })
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading) {
      loadComplaints()
    }
  }, [authLoading])

  async function loadComplaints() {
    try {
      const data = await supportService.getComplaints()
      setComplaints(data)
    } catch (error) {
      toast({
        title: "Failed to load complaints",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(complaintId: string, newStatus: string) {
    try {
      await supportService.updateComplaintStatus(complaintId, newStatus)
      setComplaints(complaints.map((c) => (c._id === complaintId ? { ...c, status: newStatus as any } : c)))
      toast({ title: "Status updated", description: "Complaint status has been changed" })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update complaint status",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "in-progress":
        return "bg-primary/10 text-primary border-primary/20"
      case "resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "closed":
        return "bg-secondary text-secondary-foreground"
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
        <h1 className="text-3xl font-bold mb-2">Support & Complaints</h1>
        <p className="text-muted-foreground">Manage customer complaints and support requests</p>
      </div>

      {complaints.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No complaints</h3>
            <p className="text-muted-foreground">All clear! No customer complaints at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <Card key={complaint._id} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{complaint.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            From: {complaint.user?.firstName} {complaint.user?.lastName}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                    </div>

                    <p className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded">{complaint.description}</p>

                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(complaint.createdAt || "").toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Select value={complaint.status} onValueChange={(value) => handleStatusChange(complaint._id, value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
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
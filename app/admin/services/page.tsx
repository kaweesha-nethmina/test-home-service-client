"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { adminService } from "@/services/adminService"
import type { Service } from "@/types/api"
import { Search, Trash2 } from "lucide-react"
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

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadServices()
  }, [])

  async function loadServices() {
    try {
      const data = await adminService.getAllServices()
      // Ensure data is an array
      if (Array.isArray(data)) {
        setServices(data)
      } else if (data && Array.isArray(data.data)) {
        // If data is an object with a data array property
        setServices(data.data)
      } else {
        // Fallback to empty array if data format is unexpected
        console.warn('Unexpected data format received:', data)
        setServices([])
      }
    } catch (error) {
      toast({
        title: "Failed to load services",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return

    try {
      await adminService.deleteService(deleteId)
      setServices(services.filter((s) => s._id !== deleteId))
      toast({ title: "Service deleted", description: "Service has been removed" })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete service",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const filteredServices = services.filter(
    (service) =>
      service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Services Management</h1>
        <p className="text-muted-foreground">Manage all services on the platform</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-10 bg-secondary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card key={service._id} className="border-border/50 overflow-hidden group">
            <div className="aspect-video relative overflow-hidden bg-secondary">
              {service.images?.[0] ? (
                <img
                  src={service.images[0].startsWith('http') ? service.images[0] : `http://localhost:5000${service.images[0]}` || "/placeholder.svg"}
                  alt={service.name || "Service"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{service.name?.[0] || "?"}</span>
                  </div>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-1">{service.name || "Unnamed Service"}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{service.description || "No description"}</p>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-primary">${service.price || 0}</div>
                <Button variant="outline" size="sm" onClick={() => setDeleteId(service._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No services found</h3>
            <p className="text-muted-foreground">Try adjusting your search query</p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
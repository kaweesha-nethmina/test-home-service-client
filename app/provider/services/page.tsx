"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { serviceService } from "@/services/serviceService"
import { categoryService } from "@/services/categoryService"
import type { Service, Category } from "@/types/api"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
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
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { useAuth } from "@/hooks/useAuth"

export default function ProviderServicesPage() {
  const { isLoading: authLoading } = useRequireAuth({ roles: ["provider"] })
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && user) {
      console.log("User authenticated:", user);
      console.log("User ID:", user._id || (user as any).id);
      console.log("User role:", user.role);
      Promise.all([loadServices(), loadCategories()])
    }
  }, [authLoading, user])

  async function loadServices() {
    try {
      const userId = user?._id || (user as any).id;
      console.log("Loading services for provider:", userId);
      // Get services for current provider
      let providerServices = await serviceService.getByProvider(userId || '')
      console.log("Loaded services:", providerServices);
      console.log("Number of services loaded:", providerServices.length);
      
      // No need for additional filtering since serviceService.getByProvider already filters correctly
      setServices(providerServices)
    } catch (error) {
      console.error("Error loading services:", error);
      toast({
        title: "Failed to load services",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  async function loadCategories() {
    try {
      // Get all categories
      const categoriesData = await categoryService.getAll()
      setCategories(categoriesData)
    } catch (error) {
      toast({
        title: "Failed to load categories",
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
      await serviceService.delete(deleteId)
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
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (authLoading || loading) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Services</h1>
          <p className="text-muted-foreground">Manage the services you provide</p>
        </div>
        <Link href="/provider/services/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </Link>
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

      {filteredServices.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No services yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Start by adding your services to showcase what you offer to customers
            </p>
            <Link href="/provider/services/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Service
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service._id} className="border-border/50 overflow-hidden group">
              <div className="aspect-video relative overflow-hidden bg-secondary">
                {service.images?.[0] ? (
                  <img
                    src={service.images[0].startsWith('http') ? service.images[0] : `http://localhost:5000${service.images[0]}` || "/placeholder.svg"}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{service.name[0]}</span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link href={`/provider/services/${service._id}`}>
                    <Button size="sm" variant="secondary">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteId(service._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-1">{service.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">${service.price}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { serviceService } from "@/services/serviceService"
import { categoryService } from "@/services/categoryService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/shared/FileUpload"
import { ArrowLeft, Loader2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Service, Category } from "@/types/api"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { useAuth } from "@/hooks/useAuth"

export default function EditServicePage() {
  const { isLoading: authLoading } = useRequireAuth({ roles: ["provider"] })
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [service, setService] = useState<Service | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    images: [] as string[],
  })

  useEffect(() => {
    if (!authLoading) {
      console.log("Edit page - User:", user);
      console.log("Edit page - Service ID:", params.id);
      Promise.all([loadService(), loadCategories()])
    }
  }, [authLoading, params.id])

  async function loadCategories() {
    try {
      const categoriesData = await categoryService.getAll()
      setCategories(categoriesData)
    } catch (error) {
      toast({
        title: "Failed to load categories",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  const loadService = async () => {
    try {
      console.log("Loading service with ID:", params.id);
      const serviceData = await serviceService.getById(params.id as string)
      console.log("Loaded service:", serviceData);
      
      if (serviceData) {
        // Check if the service belongs to the current provider
        console.log("Current user ID:", user?._id);
        console.log("Service provider ID:", serviceData.providerId);
        
        if (user && serviceData.providerId !== user._id) {
          console.log("Service does not belong to current provider");
          toast({
            title: "Access denied",
            description: "You don't have permission to edit this service",
            variant: "destructive",
          })
          router.push("/provider/services")
          return
        }
        
        setService(serviceData)
        setFormData({
          name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price.toString(),
          categoryId: serviceData.categoryId,
          images: serviceData.images || [],
        })
      } else {
        // Service not found
        setService(null)
        toast({
          title: "Error",
          description: "Service not found",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error loading service:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load service",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (url: string) => {
    // Only add actual URLs, not data URLs
    if (url && !url.startsWith('data:')) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }))
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!service) return

    setSubmitting(true)
    try {
      // Prepare the data to send - don't include providerId
      const dataToSend: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.categoryId, // Changed from categoryId to category to match backend
        images: formData.images,
        // Removed providerId to let backend derive it from authenticated user
      };
      
      console.log("Updating service with data:", JSON.stringify(dataToSend, null, 2));
      await serviceService.update(service._id, dataToSend)
      toast({
        title: "Success",
        description: "Service updated successfully",
      })
      router.push("/provider/services")
    } catch (error) {
      console.error("Error updating service:", error);
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Service not found</h2>
          <Button onClick={() => router.push("/provider/services")}>Go to Services</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8">Edit Service</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Images</Label>
                <FileUpload onUploadComplete={handleImageUpload} currentFiles={formData.images} />
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url.startsWith('http') ? url : `http://localhost:5000${url}` || "/placeholder.svg"}
                          alt={`Service ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Service"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
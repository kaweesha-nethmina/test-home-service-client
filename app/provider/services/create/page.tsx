"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/shared/FileUpload"
import { serviceService } from "@/services/serviceService"
import { categoryService } from "@/services/categoryService"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import type { Category } from "@/types/api"
import { useAuth } from "@/hooks/useAuth"

export default function CreateServicePage() {
  const { isLoading: authLoading } = useRequireAuth({ roles: ["provider"] })
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading) {
      loadCategories()
    }
  }, [authLoading])

  async function loadCategories() {
    try {
      const categoriesData = await categoryService.getAll()
      console.log("Loaded categories:", categoriesData);
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({
        title: "Failed to load categories",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (url: string) => {
    // Only add actual URLs, not data URLs
    if (url && !url.startsWith('data:')) {
      setImages((prev) => [...prev, url])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("Form data:", { name, description, price, categoryId, images });
    console.log("Selected category ID:", categoryId);
    console.log("Available categories:", categories);
    console.log("Current user:", user);
    
    // Check if the selected category exists in the available categories
    const selectedCategory = categories.find(cat => cat._id === categoryId);
    console.log("Selected category object:", selectedCategory);
    
    if (!selectedCategory) {
      console.warn("Selected category ID not found in available categories!");
      toast({
        title: "Invalid category",
        description: "Please select a valid category from the list",
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image",
        variant: "destructive",
      })
      return
    }

    if (!name.trim() || !description.trim() || !price || !categoryId) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!user || (!user._id && !(user as any).id)) {
      toast({
        title: "User not authenticated",
        description: "Please log in as a provider to create services",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare clean data to send - only actual image URLs
      const actualImages = images.filter(url => url && !url.startsWith('data:'))
      
      if (actualImages.length === 0) {
        toast({
          title: "No valid images",
          description: "Please upload valid images",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Ensure image URLs include the backend URL if they're relative paths
      const processedImages = actualImages.map(img => {
        // Let's send relative paths to the backend and let it handle the full URL
        if (img.startsWith('http://localhost:5000')) {
          return img.replace('http://localhost:5000', '');
        }
        return img;
      });

      const serviceData: any = { 
        name: name.trim(), 
        description: description.trim(), 
        price: parseFloat(price), // Ensure this is a number
        category: categoryId, // Changed from categoryId to category to match backend
        images: processedImages,
        // Removed providerId to let backend derive it from authenticated user
      }
      
      console.log("Final service data being sent:", JSON.stringify(serviceData, null, 2));
      console.log("Category ID type:", typeof serviceData.category);
      console.log("Category ID length:", serviceData.category.length);
      console.log("Price type:", typeof serviceData.price);
      console.log("Price value:", serviceData.price);
      
      await serviceService.create(serviceData)
      toast({
        title: "Service added!",
        description: "Your service has been created",
      })
      router.push("/provider/services")
    } catch (error: any) {
      console.error("Error creating service:", error)
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error code:", error.code)
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error("Error status:", error.response.status)
        console.error("Error data:", error.response.data)
      } else {
        console.error("No response object in error")
        // Check if there's a request object
        if (error.request) {
          console.error("Request was made but no response received")
        }
      }
      
      // Try to get more specific error information
      let errorMessage = "Please try again later"
      if (error.response?.status === 404) {
        if (error.response.data?.message?.includes('Category')) {
          errorMessage = "The selected category was not found. Please refresh the page and try again."
        } else {
          errorMessage = "Service not found. Please check your connection and try again."
        }
      } else if (error.response?.status === 500) {
        errorMessage = "Server error occurred. Please check that the backend server is running and try again."
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please check your connection and try again."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Failed to create service",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/provider/services">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add Service</h1>
          <p className="text-muted-foreground">Create a new service to offer to customers</p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                placeholder="e.g., Plumbing Service"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your service in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="bg-secondary/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger className="bg-secondary/50">
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

            <div className="space-y-2">
              <Label>Images</Label>
              <FileUpload onUploadComplete={handleImageUpload} maxFiles={5} currentFiles={images} />
              <p className="text-sm text-muted-foreground">Upload up to 5 images of your service</p>
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url.startsWith('http') ? url : `http://localhost:5000${url}` || "/placeholder.svg"}
                        alt={`Service ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Service"
                )}
              </Button>
              <Link href="/provider/services">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
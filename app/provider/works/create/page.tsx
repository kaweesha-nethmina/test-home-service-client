"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/shared/FileUpload"
import { workService } from "@/services/workService"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

export default function CreateWorkPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const handleImageUpload = (url: string) => {
    // Only add actual URLs, not data URLs
    if (url && !url.startsWith('data:')) {
      setImages((prev) => [...prev, url])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a portfolio item",
        variant: "destructive",
      })
      return
    }

    if (images.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image",
        variant: "destructive",
      })
      return
    }

    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
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

      const workData = { 
        title: title.trim(), 
        description: description.trim(), 
        images: actualImages,
        ...(date && { date }) // Only include date if it's set
      }
      
      console.log("Sending work data:", JSON.stringify(workData, null, 2))
      await workService.create(workData)
      toast({
        title: "Work added!",
        description: "Your portfolio has been updated",
      })
      router.push("/provider/works")
    } catch (error: any) {
      console.error("Error creating work:", error)
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
      if (error.response?.status === 500) {
        errorMessage = "Server error occurred. Please check that the backend server is running and try again."
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please check your connection and try again."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Failed to create work",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
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
        <Link href="/provider/works">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add Portfolio Item</h1>
          <p className="text-muted-foreground">Showcase your completed work</p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Work Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Modern Kitchen Renovation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the project, challenges, and results..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <FileUpload onUploadComplete={handleImageUpload} maxFiles={5} currentFiles={images} />
              <p className="text-sm text-muted-foreground">Upload up to 5 images of your work</p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Portfolio Item"
                )}
              </Button>
              <Link href="/provider/works">
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
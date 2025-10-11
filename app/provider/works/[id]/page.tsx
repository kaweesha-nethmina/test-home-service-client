"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { providerService } from "@/services/providerService"
import { workService } from "@/services/workService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { FileUpload } from "@/components/shared/FileUpload"
import { ArrowLeft, Loader2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Work } from "@/types/api"

export default function EditWorkPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [work, setWork] = useState<Work | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [] as string[],
    date: "",
  })

  useEffect(() => {
    loadWork()
  }, [params.id])

  const loadWork = async () => {
    try {
      const works = await providerService.getServices()
      // Handle paginated response - extract works array from response
      const worksData = Array.isArray(works) ? works : works.works || []
      const foundWork = worksData.find((w: Work) => w._id === params.id)
      if (foundWork) {
        setWork(foundWork)
        setFormData({
          title: foundWork.title,
          description: foundWork.description,
          images: foundWork.images || [],
          date: foundWork.date ? new Date(foundWork.date).toISOString().split('T')[0] : "",
        })
      } else {
        // Work not found
        setWork(null)
        toast({
          title: "Error",
          description: "Work not found",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error loading work:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load work",
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
    if (!work) return

    setSubmitting(true)
    try {
      // Prepare the data to send
      const dataToSend = {
        ...formData,
        ...(formData.date && { date: new Date(formData.date).toISOString() })
      };
      
      await workService.update(work._id, dataToSend)
      toast({
        title: "Success",
        description: "Work updated successfully",
      })
      router.push("/provider/works")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update work",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Work not found</h2>
          <Button onClick={() => router.push("/provider/works")}>Go to Works</Button>
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

        <h1 className="text-3xl font-bold mb-8">Edit Work</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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

              <div>
                <Label>Images</Label>
                <FileUpload onUploadComplete={handleImageUpload} currentFiles={formData.images} />
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url.startsWith('http') ? url : `http://localhost:5000${url}` || "/placeholder.svg"}
                          alt={`Work ${index + 1}`}
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
                "Update Work"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
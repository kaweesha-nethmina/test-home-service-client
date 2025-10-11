"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { providerService } from "@/services/providerService"
import { serviceService } from "@/services/serviceService"
import type { Work } from "@/types/api"
import { Plus, Pencil, Trash2 } from "lucide-react"
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

export default function ProviderWorksPage() {
  const { isLoading: authLoading } = useRequireAuth({ roles: ["provider"] })
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading) {
      loadWorks()
    }
  }, [authLoading])

  async function loadWorks() {
    try {
      console.log("Loading works...");
      const response = await providerService.getServices()
      console.log("Loaded works response:", response);
      // Handle paginated response - extract works array from response
      const worksData = Array.isArray(response) ? response : response.works || []
      console.log("Works data:", worksData);
      setWorks(worksData)
      console.log("Works loaded successfully:", worksData);
    } catch (error: any) {
      console.error("Error loading works:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      } else {
        console.error("No response object in error");
        // Check if there's a request object
        if (error.request) {
          console.error("Request was made but no response received");
        }
      }
      
      // Try to get more specific error information
      let errorMessage = "Please try again later";
      if (error.response?.status === 500) {
        errorMessage = "Server error occurred. Please check that the backend server is running and try again.";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Failed to load portfolio",
        description: errorMessage,
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
      setWorks(works.filter((w) => w._id !== deleteId))
      toast({
        title: "Work deleted",
        description: "Portfolio item has been removed",
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete portfolio item",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

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
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Portfolio</h1>
          <p className="text-muted-foreground">Showcase your best work to attract more clients</p>
        </div>
        <Link href="/provider/works/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Work
          </Button>
        </Link>
      </div>

      {works.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No portfolio items yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Start building your portfolio by adding your completed projects and showcasing your expertise
            </p>
            <Link href="/provider/works/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Work
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((work) => (
            <Card key={work._id} className="border-border/50 overflow-hidden group">
              <div className="aspect-video relative overflow-hidden bg-secondary">
                {work.images[0] ? (
                  <img
                    src={work.images[0].startsWith('http') ? work.images[0] : `http://localhost:5000${work.images[0]}` || "/placeholder.svg"}
                    alt={work.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link href={`/provider/works/${work._id}`}>
                    <Button size="sm" variant="secondary">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteId(work._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-1">{work.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{work.description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{work.images.length} images</span>
                  {work.date && (
                    <span>• {new Date(work.date).toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete portfolio item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this portfolio item.
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
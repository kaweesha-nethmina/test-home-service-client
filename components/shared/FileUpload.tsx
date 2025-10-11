"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { providerService } from "@/services/providerService"

interface FileUploadProps {
  onUploadComplete: (url: string) => void
  maxFiles?: number
  currentFiles?: string[]
}

export function FileUpload({ onUploadComplete, maxFiles = 5, currentFiles = [] }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState<string[]>(currentFiles)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (previews.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} images`,
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      for (const file of files) {
        // Upload to server and get the actual URL
        const response = await providerService.uploadImage(file)
        // Assuming the response contains a url property
        const url = response.url || response
        
        // Create preview only for data URLs
        if (typeof url === 'string' && url.startsWith('data:')) {
          // This is a data URL, use it for preview
          setPreviews((prev) => [...prev, url])
        } else {
          // This is a server URL, create a preview from the file
          const reader = new FileReader()
          reader.onloadend = () => {
            setPreviews((prev) => [...prev, reader.result as string])
          }
          reader.readAsDataURL(file)
        }
        
        // Send the actual URL to the parent component
        onUploadComplete(url)
      }

      toast({
        title: "Upload successful",
        description: `${files.length} image(s) uploaded`,
      })
    } catch (error: any) {
      console.error("FileUpload - Error uploading files:", error)
      toast({
        title: "Upload failed",
        description: error.response?.data?.message || "Failed to upload images",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || previews.length >= maxFiles}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Images
            </>
          )}
        </Button>
        <span className="text-sm text-muted-foreground">
          {previews.length} / {maxFiles} images
        </span>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
              <img
                src={preview.startsWith('http') ? preview : `http://localhost:5000${preview}`}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePreview(index)}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
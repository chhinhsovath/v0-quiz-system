"use client"

import { useState, useCallback } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  value?: string
  onChange: (imageUrl: string) => void
  maxSizeMB?: number
}

export function ImageUpload({ value, onChange, maxSizeMB = 5 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      setIsUploading(true)

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file")
        setIsUploading(false)
        return
      }

      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxSizeBytes) {
        setError(`Image size must be less than ${maxSizeMB}MB`)
        setIsUploading(false)
        return
      }

      try {
        // Convert to base64
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64String = e.target?.result as string
          onChange(base64String)
          setIsUploading(false)
        }
        reader.onerror = () => {
          setError("Failed to read image file")
          setIsUploading(false)
        }
        reader.readAsDataURL(file)
      } catch (err) {
        setError("Failed to upload image")
        setIsUploading(false)
      }
    },
    [onChange, maxSizeMB]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile]
  )

  const handleRemove = useCallback(() => {
    onChange("")
    setError(null)
  }, [onChange])

  return (
    <div className="space-y-2">
      {!value ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-6 sm:p-8 transition-all
            ${isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/25 hover:border-primary/50"}
            ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Upload image"
          />

          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <div className={`p-3 rounded-full ${isDragging ? "bg-primary/10" : "bg-muted"}`}>
              <Upload className={`h-6 w-6 sm:h-8 sm:w-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
            </div>

            <div className="space-y-1">
              <p className="text-sm sm:text-base font-medium">
                {isUploading ? "Uploading..." : isDragging ? "Drop image here" : "Drag & drop image here"}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                or click to browse (max {maxSizeMB}MB)
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="h-3 w-3" />
              <span>PNG, JPG, GIF, WebP supported</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="relative border-2 border-muted rounded-lg overflow-hidden bg-muted/30">
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full max-h-64 sm:max-h-96 object-contain"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all" />
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              Image uploaded
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-7 text-xs"
            >
              Change image
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

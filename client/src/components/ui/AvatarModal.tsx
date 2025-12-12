"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react"

interface AvatarCropModalProps {
  open: boolean
  onClose: () => void
  imageUrl: string
  onCropComplete: (croppedBlob: Blob) => void
}

interface CroppedArea {
  x: number
  y: number
  width: number
  height: number
}

export function AvatarCropModal({ open, onClose, imageUrl, onCropComplete }: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropChange = (location: { x: number; y: number }) => {
    setCrop(location)
  }

  const onZoomChange = (newZoom: number) => {
    setZoom(newZoom)
  }

  const onCropAreaChange = useCallback((_croppedArea: CroppedArea, croppedAreaPx: CroppedArea) => {
    setCroppedAreaPixels(croppedAreaPx)
  }, [])

  const createCroppedImage = async (): Promise<Blob> => {
    if (!croppedAreaPixels) throw new Error("No crop area")

    const image = new Image()
    image.src = imageUrl

    await new Promise((resolve) => {
      image.onload = resolve
    })

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("No 2d context")

    const maxSize = 512
    canvas.width = maxSize
    canvas.height = maxSize

    ctx.save()
    ctx.translate(maxSize / 2, maxSize / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-maxSize / 2, -maxSize / 2)

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      maxSize,
      maxSize,
    )

    ctx.restore()

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
        },
        "image/jpeg",
        0.9,
      )
    })
  }

  const handleSave = async () => {
    setIsProcessing(true)
    try {
      const croppedBlob = await createCroppedImage()
      onCropComplete(croppedBlob)
      onClose()
    } catch (error) {
      console.error("Error cropping image:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Crop Your Profile Picture</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Crop Area */}
          <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropAreaChange}
            />
          </div>

          {/* Zoom Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <ZoomOut className="w-4 h-4" />
              Zoom
              <ZoomIn className="w-4 h-4" />
            </label>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
              className="w-full"
            />
          </div>

          {/* Rotate Button */}
          <Button variant="outline" onClick={handleRotate} className="w-full flex items-center gap-2 bg-transparent">
            <RotateCw className="w-4 h-4" />
            Rotate 90°
          </Button>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isProcessing} className="bg-coral-500 hover:bg-coral-600 text-white">
            {isProcessing ? "Processing..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

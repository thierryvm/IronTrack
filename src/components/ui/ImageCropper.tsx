import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from './button'
import { Slider } from './slider'
import { RotateCcw, Move, ZoomIn, ZoomOut, Check, X } from 'lucide-react'

interface ImageCropperProps {
  imageUrl: string
  onCropComplete: (croppedImageUrl: string) => void
  onCancel: () => void
  aspectRatio?: number // width/height ratio (ex: 4/3, 16/9)
  className?: string
}

interface CropState {
  x: number
  y: number
  scale: number
  rotation: number
}

export function ImageCropper({ 
  imageUrl, 
  onCropComplete, 
  onCancel, 
  aspectRatio = 4/3,
  className = "" 
}: ImageCropperProps) {
  const [cropState, setCropState] = useState<CropState>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  })
  
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Load image and get natural dimensions
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.src = imageUrl
  }, [imageUrl])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - cropState.x,
      y: e.clientY - cropState.y
    })
  }, [cropState.x, cropState.y])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    
    setCropState(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }))
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({
      x: touch.clientX - cropState.x,
      y: touch.clientY - cropState.y
    })
  }, [cropState.x, cropState.y])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    
    const touch = e.touches[0]
    setCropState(prev => ({
      ...prev,
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    }))
  }, [isDragging, dragStart])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleScaleChange = useCallback((value: number[]) => {
    setCropState(prev => ({ ...prev, scale: value[0] }))
  }, [])

  const handleRotationChange = useCallback((value: number[]) => {
    setCropState(prev => ({ ...prev, rotation: value[0] }))
  }, [])

  const resetCrop = useCallback(() => {
    setCropState({ x: 0, y: 0, scale: 1, rotation: 0 })
  }, [])

  const generateCroppedImage = useCallback(async () => {
    if (!canvasRef.current || !imageRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const cropWidth = containerRect.width
    const cropHeight = containerRect.height

    // Set canvas size to match crop area
    canvas.width = cropWidth
    canvas.height = cropHeight

    // Create a temporary image to ensure it's loaded
    const tempImg = new Image()
    tempImg.crossOrigin = "anonymous"
    
    return new Promise<void>((resolve) => {
      tempImg.onload = () => {
        // Clear canvas
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, cropWidth, cropHeight)
        
        // Apply transformations
        ctx.save()
        
        // Move to center for rotation
        ctx.translate(cropWidth / 2, cropHeight / 2)
        ctx.rotate((cropState.rotation * Math.PI) / 180)
        ctx.scale(cropState.scale, cropState.scale)
        
        // Calculate image size to fill container
        const imgAspect = tempImg.width / tempImg.height
        const containerAspect = cropWidth / cropHeight
        
        let drawWidth, drawHeight
        if (imgAspect > containerAspect) {
          // Image is wider - fit to height
          drawHeight = cropHeight / cropState.scale
          drawWidth = drawHeight * imgAspect
        } else {
          // Image is taller - fit to width
          drawWidth = cropWidth / cropState.scale
          drawHeight = drawWidth / imgAspect
        }
        
        // Draw image centered, adjusted by crop position
        ctx.drawImage(
          tempImg,
          -drawWidth / 2 + cropState.x / cropState.scale,
          -drawHeight / 2 + cropState.y / cropState.scale,
          drawWidth,
          drawHeight
        )
        
        ctx.restore()
        resolve()
      }
      
      tempImg.src = imageRef.current!.src
    }).then(() => {
      // Convert to blob and create URL
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedUrl = URL.createObjectURL(blob)
          onCropComplete(croppedUrl)
        }
      }, 'image/jpeg', 0.9)
    })
  }, [cropState, onCropComplete])

  return (
    <div className={`fixed inset-0 bg-black/90 z-50 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <h3 className="text-lg font-semibold">Ajuster la photo</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-300 hover:text-white"
          >
            <X className="h-4 w-4" />
            Annuler
          </Button>
          <Button
            variant="orange"
            size="sm"
            onClick={generateCroppedImage}
          >
            <Check className="h-4 w-4 mr-2" />
            Valider
          </Button>
        </div>
      </div>

      {/* Crop Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          ref={containerRef}
          className="relative bg-gray-800 overflow-hidden cursor-move border-2 border-orange-500 touch-none"
          style={{ 
            width: 'min(80vw, 500px)', 
            height: `min(60vh, ${500 / aspectRatio}px)`,
            minWidth: '320px',
            minHeight: '240px'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="absolute"
            crossOrigin="anonymous"
            style={{
              transform: `translate(${cropState.x}px, ${cropState.y}px) scale(${cropState.scale}) rotate(${cropState.rotation}deg)`,
              transformOrigin: 'center center',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
            draggable={false}
          />
          
          {/* Crop overlay lines */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Rule of thirds grid */}
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 space-y-4">
        <div className="grid grid-cols-1 gap-6 text-white sm:grid-cols-3 sm:gap-4">
          {/* Scale Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ZoomOut className="h-4 w-4" />
              <span className="text-sm font-medium">Zoom</span>
              <ZoomIn className="h-4 w-4" />
            </div>
            <Slider
              value={[cropState.scale]}
              onValueChange={handleScaleChange}
              min={0.1}
              max={3}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-gray-400 text-center">
              {Math.round(cropState.scale * 100)}%
            </div>
          </div>

          {/* Rotation Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <RotateCcw className="h-4 w-4" />
              <span className="text-sm font-medium">Rotation</span>
            </div>
            <Slider
              value={[cropState.rotation]}
              onValueChange={handleRotationChange}
              min={-180}
              max={180}
              step={5}
              className="w-full"
            />
            <div className="text-xs text-gray-400 text-center">
              {cropState.rotation}°
            </div>
          </div>

          {/* Reset Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <Move className="h-4 w-4" />
              <span className="text-sm font-medium">Position</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetCrop}
              className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              Réinitialiser
            </Button>
            <div className="text-xs text-gray-400 text-center">
              X: {Math.round(cropState.x)}, Y: {Math.round(cropState.y)}
            </div>
          </div>
        </div>

        {/* Mobile Quick Controls */}
        <div className="flex justify-center gap-3 sm:hidden">
          <button
            onClick={() => setCropState(prev => ({ ...prev, scale: Math.max(0.1, prev.scale - 0.2) }))}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium active:bg-gray-600 min-h-[44px]"
          >
            🔍➖ Zoom -
          </button>
          <button
            onClick={() => setCropState(prev => ({ ...prev, scale: Math.min(3, prev.scale + 0.2) }))}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium active:bg-gray-600 min-h-[44px]"
          >
            🔍➕ Zoom +
          </button>
          <button
            onClick={() => setCropState(prev => ({ ...prev, rotation: prev.rotation - 15 }))}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium active:bg-gray-600 min-h-[44px]"
          >
            ↻ -15°
          </button>
        </div>

        {/* Usage Instructions */}
        <div className="text-xs text-gray-400 text-center border-t border-gray-700 pt-3">
          <p className="hidden sm:block">📱 Glissez l'image pour la repositionner • 🔍 Utilisez les contrôles pour zoomer/pivoter</p>
          <p className="sm:hidden">👆 Glissez l'image pour la déplacer • 🎛️ Utilisez les boutons ci-dessus pour ajuster</p>
        </div>
      </div>

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
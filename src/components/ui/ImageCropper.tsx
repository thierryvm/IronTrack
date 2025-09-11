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

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export function ImageCropper({ 
  imageUrl, 
  onCropComplete, 
  onCancel, 
  aspectRatio = 4/3,
  className = "" 
}: ImageCropperProps) {
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 50,
    y: 50,
    width: 200,
    height: 200 / aspectRatio
  })
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [freeMode, setFreeMode] = useState(false)
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0, cropWidth: 0, cropHeight: 0 })
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

  // Handle mouse/touch events for crop area manipulation
  const handleMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault()
    setIsDragging(handle)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      cropX: cropArea.x,
      cropY: cropArea.y,
      cropWidth: cropArea.width,
      cropHeight: cropArea.height
    })
  }, [cropArea])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    let newCropArea = { ...cropArea }

    switch (isDragging) {
      case 'move':
        newCropArea.x = Math.max(0, Math.min(rect.width - cropArea.width, dragStart.cropX + deltaX))
        newCropArea.y = Math.max(0, Math.min(rect.height - cropArea.height, dragStart.cropY + deltaY))
        break
      case 'nw':
        newCropArea.x = Math.max(0, dragStart.cropX + deltaX)
        newCropArea.y = Math.max(0, dragStart.cropY + deltaY)
        newCropArea.width = dragStart.cropWidth - deltaX
        newCropArea.height = dragStart.cropHeight - deltaY
        break
      case 'ne':
        newCropArea.y = Math.max(0, dragStart.cropY + deltaY)
        newCropArea.width = dragStart.cropWidth + deltaX
        newCropArea.height = dragStart.cropHeight - deltaY
        break
      case 'sw':
        newCropArea.x = Math.max(0, dragStart.cropX + deltaX)
        newCropArea.width = dragStart.cropWidth - deltaX
        newCropArea.height = dragStart.cropHeight + deltaY
        break
      case 'se':
        newCropArea.width = dragStart.cropWidth + deltaX
        newCropArea.height = dragStart.cropHeight + deltaY
        break
    }

    // Maintain aspect ratio if not in free mode
    if (!freeMode && (isDragging.includes('n') || isDragging.includes('s') || isDragging.includes('e') || isDragging.includes('w'))) {
      if (isDragging.includes('e') || isDragging.includes('w')) {
        newCropArea.height = newCropArea.width / aspectRatio
      } else {
        newCropArea.width = newCropArea.height * aspectRatio
      }
    }

    // Ensure minimum size
    newCropArea.width = Math.max(50, newCropArea.width)
    newCropArea.height = Math.max(50, newCropArea.height)

    // Ensure crop area stays within bounds
    newCropArea.x = Math.max(0, Math.min(rect.width - newCropArea.width, newCropArea.x))
    newCropArea.y = Math.max(0, Math.min(rect.height - newCropArea.height, newCropArea.y))

    setCropArea(newCropArea)
  }, [isDragging, dragStart, cropArea, aspectRatio, freeMode])

  const handleMouseUp = useCallback(() => {
    setIsDragging(null)
  }, [])

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent, handle: string) => {
    e.preventDefault()
    const touch = e.touches[0]
    setIsDragging(handle)
    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
      cropX: cropArea.x,
      cropY: cropArea.y,
      cropWidth: cropArea.width,
      cropHeight: cropArea.height
    })
  }, [cropArea])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    
    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    const deltaX = touch.clientX - dragStart.x
    const deltaY = touch.clientY - dragStart.y

    let newCropArea = { ...cropArea }

    switch (isDragging) {
      case 'move':
        newCropArea.x = Math.max(0, Math.min(rect.width - cropArea.width, dragStart.cropX + deltaX))
        newCropArea.y = Math.max(0, Math.min(rect.height - cropArea.height, dragStart.cropY + deltaY))
        break
      case 'se':
        newCropArea.width = dragStart.cropWidth + deltaX
        newCropArea.height = freeMode ? dragStart.cropHeight + deltaY : (dragStart.cropWidth + deltaX) / aspectRatio
        break
    }

    // Ensure minimum size and bounds
    newCropArea.width = Math.max(50, Math.min(rect.width - newCropArea.x, newCropArea.width))
    newCropArea.height = Math.max(50, Math.min(rect.height - newCropArea.y, newCropArea.height))

    setCropArea(newCropArea)
  }, [isDragging, dragStart, cropArea, aspectRatio, freeMode])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(null)
  }, [])

  const handleScaleChange = useCallback((value: number[]) => {
    setScale(value[0])
  }, [])

  const handleRotationChange = useCallback((value: number[]) => {
    setRotation(value[0])
  }, [])

  const resetCrop = useCallback(() => {
    setCropArea({
      x: 50,
      y: 50,
      width: 200,
      height: 200 / aspectRatio
    })
    setScale(1)
    setRotation(0)
  }, [aspectRatio])

  const toggleFreeMode = useCallback(() => {
    setFreeMode(prev => !prev)
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
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.scale(scale, scale)
        
        // Calculate image size to fill container
        const imgAspect = tempImg.width / tempImg.height
        const containerAspect = cropWidth / cropHeight
        
        let drawWidth, drawHeight
        if (imgAspect > containerAspect) {
          // Image is wider - fit to height
          drawHeight = cropHeight / scale
          drawWidth = drawHeight * imgAspect
        } else {
          // Image is taller - fit to width
          drawWidth = cropWidth / scale
          drawHeight = drawWidth / imgAspect
        }
        
        // Draw image centered, adjusted by crop position
        ctx.drawImage(
          tempImg,
          -drawWidth / 2 + 0 / scale,
          -drawHeight / 2 + 0 / scale,
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
  }, [cropArea, scale, rotation, onCropComplete])

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
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="absolute"
            crossOrigin="anonymous"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
            draggable={false}
          />
          
          {/* Dark overlay with cutout */}
          <div className="absolute inset-0">
            {/* Top overlay */}
            <div 
              className="absolute bg-gray-900/60 dark:bg-black/50"
              style={{
                left: 0,
                top: 0,
                width: '100%',
                height: cropArea.y
              }}
            />
            {/* Bottom overlay */}
            <div 
              className="absolute bg-gray-900/60 dark:bg-black/50"
              style={{
                left: 0,
                top: cropArea.y + cropArea.height,
                width: '100%',
                height: `calc(100% - ${cropArea.y + cropArea.height}px)`
              }}
            />
            {/* Left overlay */}
            <div 
              className="absolute bg-gray-900/60 dark:bg-black/50"
              style={{
                left: 0,
                top: cropArea.y,
                width: cropArea.x,
                height: cropArea.height
              }}
            />
            {/* Right overlay */}
            <div 
              className="absolute bg-gray-900/60 dark:bg-black/50"
              style={{
                left: cropArea.x + cropArea.width,
                top: cropArea.y,
                width: `calc(100% - ${cropArea.x + cropArea.width}px)`,
                height: cropArea.height
              }}
            />
            
            {/* Crop selection area */}
            <div
              className="absolute border-2 border-orange-500 bg-transparent cursor-move"
              style={{
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height
              }}
              onMouseDown={(e) => handleMouseDown(e, 'move')}
              onTouchStart={(e) => handleTouchStart(e, 'move')}
            >
              {/* Rule of thirds grid inside crop area */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
              </div>

              {/* Resize handles */}
              {/* Corner handles */}
              <div
                className="absolute w-4 h-4 bg-orange-500 border-2 border-white cursor-nw-resize -top-2 -left-2"
                onMouseDown={(e) => {e.stopPropagation(); handleMouseDown(e, 'nw')}}
                onTouchStart={(e) => {e.stopPropagation(); handleTouchStart(e, 'nw')}}
              />
              <div
                className="absolute w-4 h-4 bg-orange-500 border-2 border-white cursor-ne-resize -top-2 -right-2"
                onMouseDown={(e) => {e.stopPropagation(); handleMouseDown(e, 'ne')}}
                onTouchStart={(e) => {e.stopPropagation(); handleTouchStart(e, 'ne')}}
              />
              <div
                className="absolute w-4 h-4 bg-orange-500 border-2 border-white cursor-sw-resize -bottom-2 -left-2"
                onMouseDown={(e) => {e.stopPropagation(); handleMouseDown(e, 'sw')}}
                onTouchStart={(e) => {e.stopPropagation(); handleTouchStart(e, 'sw')}}
              />
              <div
                className="absolute w-4 h-4 bg-orange-500 border-2 border-white cursor-se-resize -bottom-2 -right-2"
                onMouseDown={(e) => {e.stopPropagation(); handleMouseDown(e, 'se')}}
                onTouchStart={(e) => {e.stopPropagation(); handleTouchStart(e, 'se')}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 text-white sm:grid-cols-4 sm:gap-4">
          {/* Zoom Control */}
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <ZoomOut className="h-4 w-4" />
              <span className="text-sm font-medium">Zoom</span>
              <ZoomIn className="h-4 w-4" />
            </div>
            <Slider
              value={[scale]}
              onValueChange={handleScaleChange}
              min={0.1}
              max={3}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {Math.round(scale * 100)}%
            </div>
          </div>

          {/* Rotation Control */}
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <RotateCcw className="h-4 w-4" />
              <span className="text-sm font-medium">Rotation</span>
            </div>
            <Slider
              value={[rotation]}
              onValueChange={handleRotationChange}
              min={-180}
              max={180}
              step={5}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {rotation}°
            </div>
          </div>

          {/* Proportions Control */}
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <span className="text-sm font-medium">Proportions</span>
            </div>
            <Button
              variant="overlay"
              size="sm"
              onClick={toggleFreeMode}
              className="w-full"
            >
              {freeMode ? 'Libre' : 'Contraint'}
            </Button>
            <div className="text-xs text-gray-500 text-center">
              {freeMode ? 'Libre' : `${aspectRatio.toFixed(1)}:1`}
            </div>
          </div>

          {/* Reset Control */}
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <Move className="h-4 w-4" />
              <span className="text-sm font-medium">Position</span>
            </div>
            <Button
              variant="overlay"
              size="sm"
              onClick={resetCrop}
              className="w-full"
            >
              Réinitialiser
            </Button>
            <div className="text-xs text-gray-500 text-center">
              X: {Math.round(cropArea.x)}, Y: {Math.round(cropArea.y)}
            </div>
          </div>
        </div>

        {/* Mobile Quick Controls */}
        <div className="flex justify-center gap-3 sm:hidden">
          <button
            onClick={() => setScale(prev => Math.max(0.1, prev - 0.2))}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium active:bg-gray-600 min-h-[44px]"
          >
            🔍➖ Zoom -
          </button>
          <button
            onClick={() => setScale(prev => Math.min(3, prev + 0.2))}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium active:bg-gray-600 min-h-[44px]"
          >
            🔍➕ Zoom +
          </button>
          <button
            onClick={() => setRotation(prev => prev - 15)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium active:bg-gray-600 min-h-[44px]"
          >
            ↻ -15°
          </button>
        </div>

        {/* Usage Instructions */}
        <div className="text-xs text-gray-500 text-center border-t border-gray-700 pt-3">
          <p className="hidden sm:block">📱 Glissez l'image pour la repositionner • 🔍 Utilisez les contrôles pour zoomer/pivoter</p>
          <p className="sm:hidden">👆 Glissez l'image pour la déplacer • 🎛️ Utilisez les boutons ci-dessus pour ajuster</p>
        </div>
      </div>

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
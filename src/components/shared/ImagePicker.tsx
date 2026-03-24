'use client'

import React, { useState, useCallback} from'react'
import dynamic from'next/dynamic'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter} from'@/components/ui/dialog'
import { Button} from'@/components/ui/button'
import { Input} from'@/components/ui/input'
import { Label} from'@/components/ui/label'
import { Camera} from'lucide-react'

// Dynamic import for react-easy-crop
const Cropper = dynamic(() => import('react-easy-crop'), {
 ssr: false,
 loading: () => <div className="flex items-center justify-center p-8">Chargement de l'éditeur...</div>
})

interface ImagePickerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 onImageCropped: (file: File) => Promise<void>;
 title?: string;
 description?: string;
 aspectRatio?: number;
 cropShape?:"rect" |"round";
}

export function ImagePicker({
 open,
 onOpenChange,
 onImageCropped,
 title ="Changer l'image",
 description ="Choisis une nouvelle image et cadre-la.",
 aspectRatio = 1,
 cropShape ="round"
}: ImagePickerProps) {
 const [selectedFile, setSelectedFile] = useState<File | null>(null)
 const [crop, setCrop] = useState({ x: 0, y: 0})
 const [zoom, setZoom] = useState(1)
 const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number} | null>(null)
 const [isLoading, setIsLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)

 function isHeic(file: File) {
 return (
 file.type ==='image/heic' ||
 file.type ==='image/heif' ||
 file.name.toLowerCase().endsWith('.heic') ||
 file.name.toLowerCase().endsWith('.heif')
 )
}

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 setError(null)
 let file = e.target.files?.[0]
 if (!file) return

 if (isHeic(file)) {
 setIsLoading(true)
 try {
 const heic2any: any = (await import('heic2any')).default
 const converted = await heic2any({
 blob: file,
 toType:'image/jpeg',
 quality: 0.95,
})
 const jpegBlob = Array.isArray(converted) ? converted[0] : converted
 file = new File([jpegBlob], file.name.replace(/\.(heic|heif)$/i,'.jpg'), { type:'image/jpeg'})
} catch (err) {
 setError("Erreur lors de la conversion HEIC/HEIF. Essaie de convertir manuellement !")
 setIsLoading(false)
 return
}
 setIsLoading(false)
}

 if (!file.type.startsWith('image/')) {
 setError("Le fichier doit être une image !")
 return
}
 
 setSelectedFile(file)
}

 const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
 setCroppedAreaPixels(croppedAreaPixels)
}, [])

 async function getCroppedImg(imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number}): Promise<Blob> {
 const createImage = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
 const image = new window.Image()
 image.addEventListener('load', () => resolve(image))
 image.addEventListener('error', (err) => reject(err))
 image.setAttribute('crossOrigin','anonymous')
 image.src = url
})

 const image = await createImage(imageSrc)
 const canvas = document.createElement('canvas')
 const ctx = canvas.getContext('2d')

 // On crop according to the shape
 const diameter = Math.min(pixelCrop.width, pixelCrop.height)
 canvas.width = cropShape ==="round" ? diameter : pixelCrop.width
 canvas.height = cropShape ==="round" ? diameter : pixelCrop.height

 if (!ctx) throw new Error('Impossible de récupérer le contexte du canvas')

 ctx.save()

 if (cropShape ==="round") {
 ctx.beginPath()
 ctx.arc(diameter / 2, diameter / 2, diameter / 2, 0, 2 * Math.PI)
 ctx.closePath()
 ctx.clip()
 ctx.drawImage(
 image,
 pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
 0, 0, diameter, diameter
 )
} else {
 ctx.drawImage(
 image,
 pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
 0, 0, pixelCrop.width, pixelCrop.height
 )
}

 ctx.restore()

 return new Promise((resolve) => {
 canvas.toBlob((blob) => {
 if (blob) resolve(blob)
},'image/jpeg')
})
}

 const handleValidateCrop = async () => {
 if (!selectedFile || !croppedAreaPixels) return

 setIsLoading(true)
 setError(null)

 try {
 const reader = new FileReader()
 reader.readAsDataURL(selectedFile)
 reader.onload = async () => {
 try {
 const croppedBlob = await getCroppedImg(reader.result as string, croppedAreaPixels)
 const finalFile = new File([croppedBlob], selectedFile.name.replace(/\.[^/.]+$/,".jpg"), { type:'image/jpeg'})
 
 await onImageCropped(finalFile)
 
 // Reset and close
 handleClose()
} catch (err) {
 setError("Erreur lors du recadrage.")
 setIsLoading(false)
}
}
} catch (err) {
 setError("Erreur lors de la préparation de l'image.")
 setIsLoading(false)
}
}

 const handleClose = () => {
 setSelectedFile(null)
 setCrop({ x: 0, y: 0})
 setZoom(1)
 setError(null)
 setIsLoading(false)
 onOpenChange(false)
}

 return (
 <Dialog open={open} onOpenChange={(open) => {
 if (!open) handleClose()
 else onOpenChange(true)
}}>
 <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle className="text-purple-600 flex items-center gap-2">
 <Camera className="h-6 w-6" /> 
 {title}
 </DialogTitle>
 <DialogDescription className="text-foreground">
 {description}
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-4">
 {selectedFile ? (
 <div className="flex flex-col items-center space-y-4">
 <div className="relative w-full max-w-sm h-64 bg-muted rounded-lg crop-container overflow-hidden">
 <Cropper
 image={URL.createObjectURL(selectedFile)}
 crop={crop}
 zoom={zoom}
 aspect={aspectRatio}
 cropShape={cropShape}
 showGrid={false}
 rotation={0}
 minZoom={1}
 maxZoom={3}
 zoomSpeed={1}
 restrictPosition={true}
 style={{ 
 containerStyle: { 
 position:'relative',
 width:'100%',
 height:'100%',
 borderRadius:'8px'
}
}}
 classes={{}}
 mediaProps={{}}
 cropperProps={{}}
 keyboardStep={10}
 onCropChange={setCrop}
 onZoomChange={setZoom}
 onCropComplete={onCropComplete}
 />
 </div>
 <label htmlFor="zoom-slider" className="sr-only">Niveau de zoom</label>
 <input
 id="zoom-slider"
 type="range"
 min={1}
 max={3}
 step={0.01}
 value={zoom}
 onChange={e => setZoom(Number(e.target.value))}
 className="w-48 focus:outline-none focus:ring-2 focus:ring-secondary"
 aria-label="Ajuster le niveau de zoom"
 />
 <div className="flex gap-2 w-full">
 <Button
 onClick={() => setSelectedFile(null)}
 variant="outline"
 disabled={isLoading}
 className="flex-1 min-h-[44px]"
 >
 Annuler
 </Button>
 <Button
 onClick={handleValidateCrop}
 className="flex-1 min-h-[44px] bg-purple-600 hover:bg-purple-700"
 disabled={isLoading}
 >
 {isLoading ?"Traitement..." :"Valider"}
 </Button>
 </div>
 {error && <div className="text-safe-error text-sm text-center">{error}</div>}
 </div>
 ) : (
 <div className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="image-picker-gallery" className="text-sm font-medium">
 Depuis la galerie ou fichiers
 </Label>
 <Input
 id="image-picker-gallery"
 type="file"
 accept="image/*,.heic,.heif"
 onChange={handleFileChange}
 disabled={isLoading}
 className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300"
 />
 <p className="text-xs text-safe-muted">Formats : JPG, PNG, HEIC, HEIF</p>
 </div>
 <div className="space-y-2">
 <Label htmlFor="image-picker-camera" className="text-sm font-medium">
 Prendre une photo
 </Label>
 <Input
 id="image-picker-camera"
 type="file"
 accept="image/*"
 capture="environment"
 onChange={handleFileChange}
 disabled={isLoading}
 className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300"
 />
 </div>
 {isLoading && <div className="text-safe-primary text-sm">Chargement...</div>}
 {error && <div className="text-safe-error text-sm text-center">{error}</div>}
 </div>
 )}
 </div>

 {!selectedFile && (
 <DialogFooter>
 <Button 
 onClick={handleClose} 
 variant="outline"
 className="min-h-[44px]"
 >
 Fermer
 </Button>
 </DialogFooter>
 )}
 </DialogContent>
 </Dialog>
 )
}

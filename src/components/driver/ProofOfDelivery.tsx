import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Check, X, Eraser } from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { cn } from '@/lib/utils';

interface ProofOfDeliveryProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProofOfDeliveryData) => void;
  type: 'eats' | 'move';
  requireSignature?: boolean;
}

export interface ProofOfDeliveryData {
  photoUrl?: string;
  photoBase64?: string;
  pin?: string;
  signatureUrl?: string;
  signatureBase64?: string;
}

export const ProofOfDelivery = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  requireSignature = false,
}: ProofOfDeliveryProps) => {
  const [mode, setMode] = useState<'photo' | 'pin'>('photo');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [signatureBase64, setSignatureBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // Take photo using Capacitor Camera
  const takePhoto = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const photo = await CapacitorCamera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera,
        });
        
        if (photo.base64String) {
          setPhotoBase64(`data:image/jpeg;base64,${photo.base64String}`);
        }
      } else {
        // Web fallback - file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setPhotoBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
    }
  }, []);

  // Signature canvas handlers
  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = getCanvasCoordinates(e);
    lastPosRef.current = pos;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    const pos = getCanvasCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    lastPosRef.current = pos;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    
    // Save signature as base64
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureBase64(canvas.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureBase64(null);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const data: ProofOfDeliveryData = {};
      
      if (mode === 'photo' && photoBase64) {
        data.photoBase64 = photoBase64;
      } else if (mode === 'pin' && pin.length === 4) {
        data.pin = pin;
      }
      
      if (requireSignature && signatureBase64) {
        data.signatureBase64 = signatureBase64;
      }
      
      onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    if (type === 'eats') {
      return (mode === 'photo' && photoBase64) || (mode === 'pin' && pin.length === 4);
    }
    // Move requires photo
    if (!photoBase64) return false;
    // Signature is optional for move
    return true;
  };

  const reset = () => {
    setPhotoBase64(null);
    setPin('');
    setSignatureBase64(null);
    setMode('photo');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { reset(); onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Proof of Delivery</DialogTitle>
          <DialogDescription>
            {type === 'eats' 
              ? 'Take a photo or enter the customer PIN to confirm delivery'
              : 'Take a photo of the delivered package'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Toggle for Eats */}
          {type === 'eats' && (
            <div className="flex gap-2">
              <Button
                variant={mode === 'photo' ? 'default' : 'outline'}
                onClick={() => setMode('photo')}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Photo
              </Button>
              <Button
                variant={mode === 'pin' ? 'default' : 'outline'}
                onClick={() => setMode('pin')}
                className="flex-1"
              >
                PIN Code
              </Button>
            </div>
          )}

          {/* Photo Capture */}
          {(type === 'move' || mode === 'photo') && (
            <div className="space-y-2">
              {photoBase64 ? (
                <div className="relative">
                  <img 
                    src={photoBase64} 
                    alt="Delivery photo" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setPhotoBase64(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-32 border-dashed"
                  onClick={takePhoto}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="h-8 w-8" />
                    <span>Take Photo</span>
                  </div>
                </Button>
              )}
            </div>
          )}

          {/* PIN Entry for Eats */}
          {type === 'eats' && mode === 'pin' && (
            <div className="space-y-2">
              <Label htmlFor="delivery-pin">Enter 4-digit PIN</Label>
              <Input
                id="delivery-pin"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="text-center text-2xl tracking-widest"
                placeholder="• • • •"
              />
              <p className="text-xs text-muted-foreground text-center">
                Ask the customer for their delivery PIN
              </p>
            </div>
          )}

          {/* Signature Pad for Move */}
          {type === 'move' && requireSignature && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Signature (Optional)</Label>
                {signatureBase64 && (
                  <Button variant="ghost" size="sm" onClick={clearSignature}>
                    <Eraser className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              <canvas
                ref={canvasRef}
                width={300}
                height={120}
                className={cn(
                  'w-full border rounded-lg bg-white touch-none cursor-crosshair',
                  signatureBase64 ? 'border-primary' : 'border-muted'
                )}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <p className="text-xs text-muted-foreground text-center">
                Customer signature (optional)
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            className="w-full"
            disabled={!canSubmit() || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              'Confirming...'
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Confirm Delivery
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

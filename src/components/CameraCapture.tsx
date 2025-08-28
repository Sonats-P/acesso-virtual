import React, { useRef, useState, useCallback } from 'react';
import { Camera, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CameraCaptureProps {
  onCapture: (photoBlob: Blob) => void;
  onCancel?: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreamActive(true);
      }
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreamActive(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoDataUrl);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    startCamera();
  }, [startCamera]);

  const confirmPhoto = useCallback(() => {
    if (capturedPhoto && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          onCapture(blob);
        }
      }, 'image/jpeg', 0.8);
    }
  }, [capturedPhoto, onCapture]);

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Card className="p-6 bg-gradient-card">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">Capturar Foto</h3>
        
        <div className="relative w-full max-w-md mx-auto">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            {capturedPhoto ? (
              <img 
                src={capturedPhoto} 
                alt="Foto capturada" 
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ display: isStreamActive ? 'block' : 'none' }}
              />
            )}
            
            {!isStreamActive && !capturedPhoto && (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Camera className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-3 justify-center">
          {!isStreamActive && !capturedPhoto && (
            <Button onClick={startCamera} variant="default">
              <Camera className="w-4 h-4 mr-2" />
              Iniciar Câmera
            </Button>
          )}
          
          {isStreamActive && (
            <Button onClick={capturePhoto} variant="default">
              <Camera className="w-4 h-4 mr-2" />
              Capturar
            </Button>
          )}
          
          {capturedPhoto && (
            <>
              <Button onClick={retakePhoto} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Refazer
              </Button>
              <Button onClick={confirmPhoto} variant="default">
                <Check className="w-4 h-4 mr-2" />
                Confirmar
              </Button>
            </>
          )}
          
          {onCancel && (
            <Button onClick={onCancel} variant="outline">
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
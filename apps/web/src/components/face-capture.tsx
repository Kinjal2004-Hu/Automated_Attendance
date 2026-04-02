import { useRef, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Camera, RotateCcw } from "lucide-react";

interface FaceCaptureProps {
  onCapture: (photo: Blob) => void;
  maxPhotos?: number;
  currentCount?: number;
}

export function FaceCapture({
  onCapture,
  maxPhotos = 3,
  currentCount = 0,
}: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to access camera. Please ensure you have granted camera permissions.";
      setError(message);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (
      videoRef.current &&
      canvasRef.current &&
      currentCount < maxPhotos
    ) {
      setIsCapturing(true);
      const context = canvasRef.current.getContext("2d");

      if (context) {
        // Set canvas size to match video
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        // Draw video frame to canvas
        context.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );

        // Convert canvas to blob
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            onCapture(blob);
          }
          setIsCapturing(false);
        }, "image/jpeg", 0.95);
      }
    }
  }, [currentCount, maxPhotos, onCapture]);

  // Reset camera
  const resetCamera = () => {
    stopCamera();
    setError(null);
  };

  return (
    <Card className="w-full p-4">
      <div className="space-y-4">
        {/* Title */}
        <div className="text-sm font-medium text-gray-700">
          Photo {currentCount + 1} of {maxPhotos}
        </div>

        {/* Video/Canvas */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
          {isCameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-white space-y-2">
              <Camera className="w-12 h-12 mx-auto opacity-50" />
              <p className="text-sm opacity-75">Click to start camera</p>
            </div>
          )}
        </div>

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!isCameraActive ? (
            <Button
              onClick={startCamera}
              disabled={currentCount >= maxPhotos}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button
                onClick={capturePhoto}
                disabled={isCapturing || currentCount >= maxPhotos}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture Photo
              </Button>
              <Button
                onClick={resetCamera}
                variant="outline"
                size="icon"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Info text */}
        <p className="text-xs text-gray-500 text-center">
          {currentCount >= maxPhotos
            ? "Maximum photos captured"
            : "Position your face in the center and capture clear photos from different angles for better recognition."}
        </p>
      </div>
    </Card>
  );
}

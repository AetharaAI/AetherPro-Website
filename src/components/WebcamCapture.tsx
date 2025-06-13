// src/components/WebcamCapture.tsx
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Camera, X, Check } from 'lucide-react';

interface WebcamCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.error("Error accessing webcam:", err);
        setError("Could not access webcam. Please check permissions and try again.");
      }
    } else {
      setError("Webcam access is not supported by this browser.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setError(null);
    }
    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        // dataUrl is a base64 string: "data:image/jpeg;base64,..."
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      // Remove the "data:image/jpeg;base64," prefix
      const base64String = capturedImage.split(',')[1];
      onCapture(base64String);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-xl font-bold mb-4">Capture Image</h2>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="relative bg-black rounded-md overflow-hidden">
              {capturedImage ? (
                <img src={capturedImage} alt="Captured frame" />
              ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full h-auto"></video>
              )}
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              {capturedImage ? (
                <>
                  <button onClick={() => setCapturedImage(null)} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Retake</button>
                  <button onClick={handleConfirm} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center"><Check className="w-4 h-4 mr-2" />Confirm</button>
                </>
              ) : (
                <button onClick={handleCapture} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"><Camera className="w-4 h-4 mr-2" />Capture</button>
              )}
            </div>
          </>
        )}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><X /></button>
      </div>
    </div>
  );
};

export default WebcamCapture;
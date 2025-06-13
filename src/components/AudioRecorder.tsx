// src/components/AudioRecorder.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Check, Square } from 'lucide-react';

interface AudioRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (audioData: { base64: string; blob: Blob; }) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ isOpen, onClose, onCapture }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setError(null);
    setAudioBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        // Clean up stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleConfirm = () => {
    if (audioBlob) {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onCapture({ base64: base64String, blob: audioBlob });
        onClose();
      };
    }
  };

  useEffect(() => {
    // Reset state when the modal is closed
    if (!isOpen) {
      setIsRecording(false);
      setAudioBlob(null);
      setError(null);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Record Audio</h2>
        {error ? (
          <p className="text-red-500 my-4">{error}</p>
        ) : (
          <div className="my-6">
            {!isRecording && !audioBlob && (
              <button onClick={startRecording} className="p-6 bg-red-600 text-white rounded-full hover:bg-red-700">
                <Mic className="w-10 h-10" />
              </button>
            )}
            {isRecording && (
              <div className="space-y-4">
                <p className="text-gray-500 dark:text-gray-400 animate-pulse">Recording...</p>
                <button onClick={stopRecording} className="p-6 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                  <Square className="w-10 h-10" />
                </button>
              </div>
            )}
            {audioBlob && (
              <div className="space-y-4">
                <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />
                <div className="flex justify-center space-x-4 pt-4">
                  <button onClick={startRecording} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Record Again</button>
                  <button onClick={handleConfirm} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center"><Check className="w-4 h-4 mr-2" />Use this Audio</button>
                </div>
              </div>
            )}
          </div>
        )}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><X /></button>
      </div>
    </div>
  );
};

export default AudioRecorder;
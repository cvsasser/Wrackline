import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Upload, RefreshCw, Sparkles, Shell, AlertCircle } from 'lucide-react';
import { SAMPLE_SHELLS } from '../utils/sampleData';
import { SampleShell, ShellIdentification } from '../types';

interface CameraScannerProps {
  onAnalyzePhoto: (base64Data: string, mimeType: string) => void;
  onSelectSample: (sample: SampleShell) => void;
  isLoading: boolean;
  error: string | null;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onAnalyzePhoto,
  onSelectSample,
  isLoading,
  error,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start live camera stream
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access error or denied:', err);
      setIsCameraActive(false);
      // Fallback to gallery file input click
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture frame from video feed
  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 800;
    canvas.height = videoRef.current.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setSelectedImage(dataUrl);
      setMimeType('image/jpeg');
      stopCamera();
    }
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
        setMimeType(file.type || 'image/jpeg');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyzeClick = () => {
    if (selectedImage) {
      onAnalyzePhoto(selectedImage, mimeType);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    stopCamera();
  };

  return (
    <div className="space-y-6">
      {/* Scanner Main Container */}
      <div className="bg-[#8FBBAA]/20 p-6 sm:p-10 rounded-3xl border-2 border-[#8FBBAA] flex flex-col items-center justify-center gap-4 text-center relative shadow-sm max-w-2xl mx-auto">
        {/* Large Round Camera Icon Badge */}
        <div className="w-20 h-20 bg-[#16393D] rounded-full flex items-center justify-center text-[#F0EAD9] shadow-md border-2 border-[#8FBBAA]">
          <Camera className="w-9 h-9 text-[#8FBBAA]" />
        </div>

        <div className="space-y-1 max-w-md">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-60 text-[#16393D]">
            FIELD SPECIMEN ANALYZER
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#16393D] tracking-tight">
            Identify Specimen
          </h2>
          <p className="text-xs sm:text-sm font-sans text-[#16393D]/80">
            Snap a photo or upload an image of your beach find
          </p>
        </div>

        {/* Camera Feed / Photo Preview or Action Options */}
        <div className="w-full max-w-md mt-2">
          {isCameraActive ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#16393D] bg-black aspect-4/3 shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4 z-10">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2 bg-[#FAF6ED] text-[#16393D] rounded-full text-xs font-sans font-bold shadow hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={captureFrame}
                  className="w-14 h-14 rounded-full bg-[#16393D] border-4 border-[#8FBBAA] flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  title="Capture Photo"
                >
                  <Camera className="w-7 h-7 text-[#FAF6ED]" />
                </button>
              </div>
            </div>
          ) : selectedImage ? (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border-2 border-[#16393D] bg-[#FAF6ED] p-2 shadow-inner">
                <img
                  src={selectedImage}
                  alt="Captured seashell specimen"
                  className="w-full h-60 sm:h-64 object-contain rounded bg-stone-100"
                />

                <button
                  onClick={handleClear}
                  className="absolute top-4 right-4 bg-[#16393D] text-[#FAF6ED] p-2 rounded-full shadow transition-colors hover:bg-[#16393D]/80"
                  title="Retake photo"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyzeClick}
                disabled={isLoading}
                className={`w-full py-4 bg-[#16393D] text-[#F0EAD9] rounded-xl font-bold font-sans uppercase text-xs tracking-widest shadow-md flex items-center justify-center gap-2 transition-all ${
                  isLoading
                    ? 'opacity-80 cursor-wait'
                    : 'hover:bg-[#16393D]/90 active:scale-[0.99]'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#8FBBAA]" />
                    Analyzing Shell Morphology...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#8FBBAA]" />
                    Analyze & Identify Shell
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-4 bg-[#16393D] text-[#F0EAD9] rounded-xl font-bold font-sans uppercase text-xs tracking-widest shadow hover:bg-[#16393D]/90 transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4 text-[#8FBBAA]" />
                Scan a Shell (Camera)
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-sans font-semibold text-[#16393D] underline opacity-80 hover:opacity-100 transition-opacity block mx-auto py-1"
              >
                Import from Gallery
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Error notification if present */}
        {error && (
          <div className="mt-2 w-full max-w-md p-3 bg-[#D98C93]/20 border border-[#D98C93] rounded-lg flex items-start gap-2 text-xs text-[#16393D] text-left">
            <AlertCircle className="w-4 h-4 text-[#D98C93] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Identification Error</p>
              <p className="mt-0.5 opacity-90">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Identifications / Sample Shells Bar */}
      <div className="bg-white bg-opacity-40 p-5 rounded-2xl border border-[#16393D]/20 max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase tracking-wider opacity-60 font-sans font-bold text-[#16393D]">
            Sample Shell Specimens
          </h4>
          <span className="text-[10px] font-sans opacity-50 font-semibold">Tap to load specimen</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_SHELLS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className="group text-left p-2.5 rounded-xl border border-[#16393D]/30 bg-[#F0EAD9]/50 hover:bg-[#FAF6ED] hover:border-[#16393D] transition-all flex flex-col justify-between"
            >
              <div className="w-full aspect-square bg-[#8FBBAA]/30 rounded-lg border border-[#16393D] overflow-hidden mb-2">
                <img
                  src={sample.image}
                  alt={sample.commonName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-[#16393D] truncate font-serif">
                  {sample.commonName}
                </p>
                <p className="text-[10px] italic text-[#16393D]/70 truncate font-serif">
                  {sample.scientificName}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

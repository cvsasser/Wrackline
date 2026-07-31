import React, { useRef, useState } from 'react';
import { Camera, RefreshCw, Sparkles, AlertCircle, Focus, Layers, CheckCircle2, X } from 'lucide-react';
import { SAMPLE_SHELLS } from '../utils/sampleData';
import { SampleShell } from '../types';

interface CameraScannerProps {
  onAnalyzePhoto: (topViewBase64: string, apertureViewBase64: string, profileViewBase64?: string) => void;
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
  // Three-shot state management
  const [topViewImage, setTopViewImage] = useState<string | null>(null);
  const [apertureViewImage, setApertureViewImage] = useState<string | null>(null);
  const [profileViewImage, setProfileViewImage] = useState<string | null>(null);

  // Currently active capture target (1 = Top View, 2 = Aperture View, 3 = Profile View)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start live camera stream targeting active step
  const startCamera = async (stepTarget?: 1 | 2 | 3) => {
    const target = stepTarget || (!topViewImage ? 1 : !apertureViewImage ? 2 : 3);
    setActiveStep(target);
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
      // Fallback to gallery file input
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

  // Capture frame from live camera feed
  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 800;
    canvas.height = videoRef.current.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

      if (activeStep === 1) {
        setTopViewImage(dataUrl);
        stopCamera();
        if (!apertureViewImage) {
          setActiveStep(2);
        }
      } else if (activeStep === 2) {
        setApertureViewImage(dataUrl);
        stopCamera();
        if (!profileViewImage) {
          setActiveStep(3);
        }
      } else {
        setProfileViewImage(dataUrl);
        stopCamera();
      }
    }
  };

  // Handle gallery file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileInput = (stepTarget: 1 | 2 | 3) => {
    setActiveStep(stepTarget);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        if (activeStep === 1) {
          setTopViewImage(dataUrl);
          if (!apertureViewImage) {
            setActiveStep(2);
          }
        } else if (activeStep === 2) {
          setApertureViewImage(dataUrl);
          if (!profileViewImage) {
            setActiveStep(3);
          }
        } else {
          setProfileViewImage(dataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeClick = () => {
    if (topViewImage) {
      onAnalyzePhoto(
        topViewImage,
        apertureViewImage || topViewImage,
        profileViewImage || undefined
      );
    }
  };

  const handleClearStep = (stepToClear: 1 | 2 | 3) => {
    if (stepToClear === 1) {
      setTopViewImage(null);
      setActiveStep(1);
    } else if (stepToClear === 2) {
      setApertureViewImage(null);
      setActiveStep(2);
    } else {
      setProfileViewImage(null);
      setActiveStep(3);
    }
    stopCamera();
  };

  // Calculate views count for button label
  const totalViews = [topViewImage, apertureViewImage, profileViewImage].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Scanner Container */}
      <div className="bg-[#8FBBAA]/20 p-6 sm:p-8 rounded-3xl border-2 border-[#8FBBAA] flex flex-col items-center justify-center gap-4 text-center relative shadow-sm max-w-3xl mx-auto">

        {/* Header Badge */}
        <div className="flex items-center gap-2 bg-[#16393D] text-[#FAF6ED] px-4 py-1.5 rounded-full text-xs font-sans font-bold uppercase tracking-widest shadow-xs">
          <Layers className="w-4 h-4 text-[#8FBBAA]" />
          <span>Guided Multi-View Identification</span>
        </div>

        <div className="space-y-1 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#16393D] tracking-tight">
            Beachcombing Field Capture
          </h2>
          <p className="text-xs sm:text-sm font-sans text-[#16393D]/80">
            Take photos of your find (main view, second angle, & optional side profile) for AI identification of seashells, coral, and shark teeth.
          </p>
        </div>

        {/* Mandatory On-Screen Guidance Banner */}
        <div className="w-full max-w-lg bg-[#FAF6ED] border border-[#16393D]/30 px-3.5 py-2 rounded-xl text-xs font-sans font-bold text-[#16393D] flex items-center justify-center gap-2 shadow-xs">
          <Focus className="w-4 h-4 text-[#D9A87E] shrink-0" />
          <span>One specimen per photo — remove other objects from frame.</span>
        </div>

        {/* Main Camera Viewfinder OR Multi-Shot Thumbnails Grid */}
        <div className="w-full max-w-2xl mt-1">
          {isCameraActive ? (
            /* Live Camera Feed with Overlay Guide */
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#16393D] bg-black aspect-4/3 max-w-md mx-auto shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Step Title Overlay */}
              <div className="absolute top-3 inset-x-3 bg-[#16393D]/90 backdrop-blur-xs text-[#FAF6ED] p-2 rounded-lg text-xs font-sans text-center shadow">
                <p className="font-bold uppercase tracking-wider text-[#8FBBAA] text-[10px]">
                  Shot {activeStep} of 3 {activeStep === 3 ? '(Optional)' : ''}
                </p>
                <p className="font-semibold text-xs mt-0.5">
                  {activeStep === 1
                    ? 'Main view — place one specimen on a plain surface, filling the frame'
                    : activeStep === 2
                    ? 'Second angle — tilt or flip to show opposite side, opening, or root'
                    : 'Side profile — show silhouette height and contour'}
                </p>
              </div>

              {/* Circular/Square Positioning Overlay Guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
                <div className="w-56 h-56 border-2 border-dashed border-[#8FBBAA] rounded-full flex items-center justify-center relative shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                  {/* Subtle alignment crosshair */}
                  <div className="w-4 h-0.5 bg-[#8FBBAA]/60 absolute left-2" />
                  <div className="w-4 h-0.5 bg-[#8FBBAA]/60 absolute right-2" />
                  <div className="h-4 w-0.5 bg-[#8FBBAA]/60 absolute top-2" />
                  <div className="h-4 w-0.5 bg-[#8FBBAA]/60 absolute bottom-2" />
                  <span className="text-[10px] font-mono text-[#FAF6ED]/80 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">
                    Align Specimen
                  </span>
                </div>
              </div>

              {/* Camera Action Buttons */}
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
                  title="Capture Shot"
                >
                  <Camera className="w-7 h-7 text-[#FAF6ED]" />
                </button>
              </div>
            </div>
          ) : (
            /* Guided Three-Shot Cards View */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Step 1 Thumbnail Card */}
                <div className="bg-[#FAF6ED] rounded-2xl border-2 border-[#16393D] p-3 flex flex-col justify-between items-center relative text-center min-h-[185px]">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#16393D] flex items-center gap-1 mb-1.5">
                    {topViewImage ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16393D]" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full bg-[#16393D] text-white text-[9px] flex items-center justify-center font-bold">1</span>
                    )}
                    Step 1: Main View
                  </span>

                  {topViewImage ? (
                    <div className="w-full space-y-2">
                      <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden border border-[#16393D]/30 relative group shadow-inner">
                        <img
                          src={topViewImage}
                          alt="Main view"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => startCamera(1)}
                        className="w-full py-1.5 px-2 bg-[#16393D]/10 hover:bg-[#16393D]/20 text-[#16393D] rounded-lg text-[11px] font-sans font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Retake Shot 1
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex-1 flex flex-col items-center justify-center gap-2">
                      <p className="text-[11px] font-sans text-[#16393D]/70 px-1">
                        Main view on plain surface
                      </p>
                      <button
                        type="button"
                        onClick={() => startCamera(1)}
                        className="w-full py-2 bg-[#16393D] text-[#FAF6ED] hover:bg-[#16393D]/90 rounded-xl text-xs font-sans font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#8FBBAA]" /> Snap Shot 1
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerFileInput(1)}
                        className="text-[10px] font-sans text-[#16393D] underline opacity-80 hover:opacity-100"
                      >
                        Upload photo
                      </button>
                    </div>
                  )}
                </div>

                {/* Step 2 Thumbnail Card */}
                <div className="bg-[#FAF6ED] rounded-2xl border-2 border-[#16393D] p-3 flex flex-col justify-between items-center relative text-center min-h-[185px]">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#16393D] flex items-center gap-1 mb-1.5">
                    {apertureViewImage ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16393D]" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full bg-[#16393D] text-white text-[9px] flex items-center justify-center font-bold">2</span>
                    )}
                    Step 2: Second Angle
                  </span>

                  {apertureViewImage ? (
                    <div className="w-full space-y-2">
                      <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden border border-[#16393D]/30 relative group shadow-inner">
                        <img
                          src={apertureViewImage}
                          alt="Second angle view"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => startCamera(2)}
                        className="w-full py-1.5 px-2 bg-[#16393D]/10 hover:bg-[#16393D]/20 text-[#16393D] rounded-lg text-[11px] font-sans font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Retake Shot 2
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex-1 flex flex-col items-center justify-center gap-2">
                      <p className="text-[11px] font-sans text-[#16393D]/70 px-1">
                        Tilt/flip to show opposite side or opening
                      </p>
                      <button
                        type="button"
                        onClick={() => startCamera(2)}
                        disabled={!topViewImage}
                        className={`w-full py-2 rounded-xl text-xs font-sans font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 ${
                          topViewImage
                            ? 'bg-[#16393D] text-[#FAF6ED] hover:bg-[#16393D]/90'
                            : 'bg-[#16393D]/40 text-[#FAF6ED]/70 cursor-not-allowed'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5 text-[#8FBBAA]" /> Snap Shot 2
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerFileInput(2)}
                        className="text-[10px] font-sans text-[#16393D] underline opacity-80 hover:opacity-100"
                      >
                        Upload photo
                      </button>
                    </div>
                  )}
                </div>

                {/* Step 3 Thumbnail Card (Optional Profile View) */}
                <div className="bg-[#FAF6ED] rounded-2xl border-2 border-[#16393D] p-3 flex flex-col justify-between items-center relative text-center min-h-[185px]">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#16393D] flex items-center gap-1 mb-1.5">
                    {profileViewImage ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16393D]" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full bg-[#16393D]/50 text-white text-[9px] flex items-center justify-center font-bold">3</span>
                    )}
                    Step 3: Profile <span className="text-[#D9A87E] font-normal">(Optional)</span>
                  </span>

                  {profileViewImage ? (
                    <div className="w-full space-y-2">
                      <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden border border-[#16393D]/30 relative group shadow-inner">
                        <img
                          src={profileViewImage}
                          alt="Side profile view"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => startCamera(3)}
                          className="flex-1 py-1.5 px-1 bg-[#16393D]/10 hover:bg-[#16393D]/20 text-[#16393D] rounded-lg text-[10px] font-sans font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Retake
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClearStep(3)}
                          className="py-1.5 px-2 bg-stone-200 hover:bg-stone-300 text-[#16393D] rounded-lg text-[10px] font-sans font-bold transition-colors flex items-center justify-center gap-1"
                          title="Remove Shot 3"
                        >
                          <X className="w-3 h-3" /> Skip
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex-1 flex flex-col items-center justify-center gap-1.5">
                      <p className="text-[10px] font-sans text-[#16393D]/70 px-1 leading-tight">
                        Side view, showing silhouette & height profile
                      </p>
                      <button
                        type="button"
                        onClick={() => startCamera(3)}
                        disabled={!topViewImage}
                        className={`w-full py-1.5 rounded-xl text-xs font-sans font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 ${
                          topViewImage
                            ? 'bg-[#16393D] text-[#FAF6ED] hover:bg-[#16393D]/90'
                            : 'bg-[#16393D]/40 text-[#FAF6ED]/70 cursor-not-allowed'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5 text-[#8FBBAA]" /> Snap Shot 3
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerFileInput(3)}
                        className="text-[10px] font-sans text-[#16393D] underline opacity-80 hover:opacity-100"
                      >
                        Upload photo
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Final Analyze Action CTA */}
              {topViewImage && (
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
                      Analyzing Specimen Morphology & Details...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#8FBBAA]" />
                      Identify Specimen ({totalViews} {totalViews === 1 ? 'View' : 'Views'})
                    </>
                  )}
                </button>
              )}

              {/* Hidden file input element */}
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

        {/* Error Notification */}
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

      {/* Pre-loaded Sample Specimens Bar */}
      <div className="bg-white bg-opacity-40 p-5 rounded-2xl border border-[#16393D]/20 max-w-3xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase tracking-wider opacity-60 font-sans font-bold text-[#16393D]">
            Sample Beachcombing Specimens
          </h4>
          <span className="text-[10px] font-sans opacity-50 font-semibold">Tap to test sample</span>
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

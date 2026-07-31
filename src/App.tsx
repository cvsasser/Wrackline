/**
 * Wrackline - Seashell Identification & Beachcombing Logbook
 */
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CameraScanner } from './components/CameraScanner';
import { SpecimenCard } from './components/SpecimenCard';
import { MyFindsTab } from './components/MyFindsTab';
import { FindSpotTab } from './components/FindSpotTab';
import {
  getStoredApiKey,
  setStoredApiKey,
  getSavedFinds,
  saveFind,
  deleteFind,
  getCurrentBeachLocation,
} from './utils/storage';
import { ShellIdentification, LocationInfo, SavedFind, SampleShell } from './types';
import { Compass, BookMarked, Shell, RefreshCw, AlertCircle, MapPin } from 'lucide-react';

export default function App() {
  // State initialization
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [savedFinds, setSavedFinds] = useState<SavedFind[]>([]);
  
  const [activeTab, setActiveTab] = useState<'scan' | 'spots' | 'finds'>('scan');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active identification state
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [currentIdentification, setCurrentIdentification] = useState<ShellIdentification | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>({ beachName: 'Beach Tag' });

  // On initial mount: load stored key & saved finds, prompt key modal on first run if no key saved
  useEffect(() => {
    const key = getStoredApiKey();
    setApiKey(key);
    
    const finds = getSavedFinds();
    setSavedFinds(finds);

    // Prompt for Gemini API Key on first run if not set
    const firstRunDone = localStorage.getItem('wrackline_has_run_before');
    if (!firstRunDone && !key) {
      setIsApiKeyModalOpen(true);
      localStorage.setItem('wrackline_has_run_before', 'true');
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setStoredApiKey(key);
    setApiKey(key);
  };

  // Perform AI identification via server API route /api/identify
  const handleAnalyzePhoto = async (topViewBase64: string, apertureViewBase64: string, profileViewBase64?: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentPhoto(topViewBase64);

    // Fetch device location concurrently
    const loc = await getCurrentBeachLocation();
    setCurrentLocation(loc);

    try {
      const response = await fetch('/api/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-gemini-key': apiKey } : {}),
        },
        body: JSON.stringify({
          topViewBase64,
          apertureViewBase64,
          profileViewBase64,
          customApiKey: apiKey,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to identify specimen.');
      }

      setCurrentIdentification(json.data);
      // Scroll smoothly to specimen card
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Identification Error:', err);
      setError(err?.message || 'Failed to analyze specimen image. Please verify API key in settings or try another photo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Select pre-loaded sample shell
  const handleSelectSample = async (sample: SampleShell) => {
    setIsLoading(true);
    setError(null);
    setCurrentPhoto(sample.image);

    const loc = await getCurrentBeachLocation();
    setCurrentLocation({
      ...loc,
      beachName: sample.id === 'sample-junonia' ? 'Sanibel Island, FL • Gulf Coast' : loc.beachName,
    });

    // Simulate short processing for smooth feedback
    setTimeout(() => {
      setCurrentIdentification(sample.sampleData);
      setIsLoading(false);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }, 400);
  };

  const handleSaveCurrentFind = (userNotes: string) => {
    if (currentPhoto && currentIdentification) {
      const newFind = saveFind(currentPhoto, currentIdentification, currentLocation, userNotes);
      setSavedFinds(getSavedFinds());
    }
  };

  const handleDeleteFind = (id: string) => {
    const updated = deleteFind(id);
    setSavedFinds(updated);
  };

  const handleResetScan = () => {
    setCurrentPhoto(null);
    setCurrentIdentification(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F0EAD9] text-[#16393D] flex flex-col font-sans selection:bg-[#8FBBAA]/40 pb-20 md:pb-8">
      {/* Top Field Bar Header */}
      <Header
        apiKeySet={!!apiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        savedCount={savedFinds.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 py-6 flex-1 space-y-6">
        {activeTab === 'scan' ? (
          <div className="space-y-6">
            {/* If an identification result exists, show Specimen Card */}
            {currentIdentification && currentPhoto ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#FAF6ED] border border-[#16393D]/30 p-3 rounded-xl shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8FBBAA] animate-ping" />
                    <p className="text-xs font-bold text-[#16393D] font-display">
                      Identification Complete
                    </p>
                  </div>

                  <button
                    onClick={handleResetScan}
                    className="py-1.5 px-3 bg-[#16393D] text-[#FAF6ED] hover:bg-[#16393D]/90 rounded-md text-xs font-bold font-serif shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Scan Another Specimen
                  </button>
                </div>

                <SpecimenCard
                  photoUrl={currentPhoto}
                  identification={currentIdentification}
                  location={currentLocation}
                  onSaveFind={handleSaveCurrentFind}
                  onResetScan={handleResetScan}
                />
              </div>
            ) : (
              /* Scanner View */
              <CameraScanner
                onAnalyzePhoto={handleAnalyzePhoto}
                onSelectSample={handleSelectSample}
                isLoading={isLoading}
                error={error}
              />
            )}
          </div>
        ) : activeTab === 'spots' ? (
          /* Find a Spot Tab */
          <FindSpotTab savedFinds={savedFinds} apiKey={apiKey} />
        ) : (
          /* My Finds Tab */
          <MyFindsTab
            finds={savedFinds}
            onDeleteFind={handleDeleteFind}
            onNavigateToScan={() => setActiveTab('scan')}
          />
        )}
      </main>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />

      {/* Mobile Bottom Floating Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF6ED]/95 backdrop-blur-md border-t-2 border-[#16393D]/20 px-4 py-2 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'scan'
                ? 'text-[#16393D] font-bold'
                : 'text-[#16393D]/60 hover:text-[#16393D]'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-mono-tag tracking-wider uppercase">Scan</span>
          </button>

          <button
            onClick={() => setActiveTab('spots')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'spots'
                ? 'text-[#16393D] font-bold'
                : 'text-[#16393D]/60 hover:text-[#16393D]'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[10px] font-mono-tag tracking-wider uppercase">Find Spot</span>
          </button>

          <button
            onClick={() => setActiveTab('finds')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg relative transition-colors cursor-pointer ${
              activeTab === 'finds'
                ? 'text-[#16393D] font-bold'
                : 'text-[#16393D]/60 hover:text-[#16393D]'
            }`}
          >
            <BookMarked className="w-5 h-5" />
            <span className="text-[10px] font-mono-tag tracking-wider uppercase">My Finds</span>
            {savedFinds.length > 0 && (
              <span className="absolute top-1 right-2 bg-[#D98C93] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs">
                {savedFinds.length}
              </span>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}

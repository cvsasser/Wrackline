import React from 'react';
import { Compass, Key, Shell, BookMarked, MapPin } from 'lucide-react';

interface HeaderProps {
  apiKeySet: boolean;
  onOpenApiKeyModal: () => void;
  savedCount: number;
  activeTab: 'scan' | 'spots' | 'finds';
  onTabChange: (tab: 'scan' | 'spots' | 'finds') => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiKeySet,
  onOpenApiKeyModal,
  savedCount,
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="bg-[#FAF6ED] border-b-2 border-[#16393D] sticky top-0 z-30 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        {/* Logo & Brand Title */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => onTabChange('scan')}>
          <div className="w-11 h-11 rounded-full bg-[#16393D] flex items-center justify-center text-[#F0EAD9] shadow-sm border-2 border-[#8FBBAA]">
            <Shell className="w-6 h-6 transform -rotate-12" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-60 text-[#16393D]">
                NATURALIST FIELD GUIDE v1.0
              </span>
            </div>
            <h1 className="text-3xl font-black font-display text-[#16393D] tracking-tight leading-none">
              Wrackline
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Key status button */}
          <button
            onClick={onOpenApiKeyModal}
            title={apiKeySet ? 'Gemini API Key configured' : 'Click to add Gemini API Key'}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans font-bold transition-all border cursor-pointer ${
              apiKeySet
                ? 'bg-[#8FBBAA]/20 text-[#16393D] border-[#8FBBAA] hover:bg-[#8FBBAA]/40'
                : 'bg-[#D98C93]/20 text-[#16393D] border-[#D98C93] hover:bg-[#D98C93]/40 animate-pulse'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-[#16393D]" />
            <span className="hidden sm:inline">
              {apiKeySet ? 'API Key Active' : 'Set API Key'}
            </span>
          </button>

          {/* Quick Tab Switch buttons for Desktop Header */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => onTabChange('scan')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-sans font-bold shadow-xs transition-all cursor-pointer ${
                activeTab === 'scan'
                  ? 'bg-[#16393D] text-[#F0EAD9]'
                  : 'bg-[#8FBBAA] text-[#16393D] hover:bg-[#8FBBAA]/80'
              }`}
            >
              <Compass className="w-4 h-4" />
              Scan Specimen
            </button>
            <button
              onClick={() => onTabChange('spots')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-sans font-bold shadow-xs transition-all cursor-pointer ${
                activeTab === 'spots'
                  ? 'bg-[#16393D] text-[#F0EAD9]'
                  : 'bg-[#8FBBAA] text-[#16393D] hover:bg-[#8FBBAA]/80'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Find a Spot
            </button>
            <button
              onClick={() => onTabChange('finds')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-sans font-bold shadow-xs transition-all cursor-pointer ${
                activeTab === 'finds'
                  ? 'bg-[#16393D] text-[#F0EAD9]'
                  : 'bg-[#8FBBAA] text-[#16393D] hover:bg-[#8FBBAA]/80'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              My Finds ({savedCount})
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};


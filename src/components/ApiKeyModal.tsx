import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, X, Check, Info } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSaveKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  onSaveKey,
}) => {
  const [inputKey, setInputKey] = useState(currentKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setInputKey(currentKey);
  }, [currentKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(inputKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16393D]/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-2xl border-2 border-[#16393D] shadow-xl relative text-[#16393D]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#16393D]/60 hover:text-[#16393D] rounded-full hover:bg-[#F0EAD9] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-14 h-14 bg-[#16393D] border-2 border-[#8FBBAA] rounded-full flex items-center justify-center mx-auto mb-3 text-[#F0EAD9]">
            <Key className="w-6 h-6 text-[#8FBBAA]" />
          </div>
          
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-60 text-[#16393D]">
            FIELD GUIDE CONFIGURATION
          </span>
          <h2 className="text-2xl font-black font-display tracking-tight text-[#16393D]">
            Gemini Vision API Key
          </h2>
          <p className="text-xs text-[#16393D]/80 font-sans mt-1">
            Required for AI seashell identification and field guide taxonomy
          </p>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-sans uppercase tracking-wider font-bold mb-1">
              API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2.5 bg-[#F0EAD9] border-2 border-[#16393D]/40 rounded-xl text-xs font-mono focus:outline-none focus:border-[#16393D] transition-colors"
              />
            </div>
            <p className="text-[11px] text-[#16393D]/70 mt-1.5 flex items-start gap-1 font-sans">
              <Info className="w-3.5 h-3.5 text-[#16393D] shrink-0 mt-0.5" />
              <span>
                Your API key is stored <strong>locally in your browser</strong> (`localStorage`).
              </span>
            </p>
          </div>

          <div className="p-3 bg-[#8FBBAA]/20 border border-[#8FBBAA] rounded-xl text-xs text-[#16393D] space-y-1 font-sans">
            <p className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#16393D]" />
              Free Key Available
            </p>
            <p>
              Get a free API key at{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="underline font-bold text-[#16393D] hover:text-[#D98C93]"
              >
                aistudio.google.com
              </a>
              .
            </p>
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-[#8FBBAA] text-[#16393D] rounded-xl text-xs text-center font-bold font-sans uppercase tracking-wider flex items-center justify-center gap-1">
              <Check className="w-4 h-4" /> API Key Saved!
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {currentKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-3 border-2 border-[#D98C93] text-[#D98C93] hover:bg-[#D98C93]/10 text-xs font-sans font-bold uppercase tracking-wider rounded-xl transition-colors"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3.5 bg-[#16393D] text-[#FAF6ED] hover:bg-[#16393D]/90 text-xs font-bold font-sans uppercase tracking-widest rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 text-[#8FBBAA]" /> Save Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

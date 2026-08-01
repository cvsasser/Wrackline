import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { SavedFind, SpotLocationResult, LocationInfo } from '../types';
import { getCurrentBeachLocation } from '../utils/storage';
import {
  MapPin,
  Search,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Compass,
  Sparkles,
  Bookmark,
  Globe,
  Info,
  ShieldAlert,
} from 'lucide-react';

interface FindSpotTabProps {
  savedFinds: SavedFind[];
  apiKey: string;
}

const DEFAULT_SHORTCUTS = [
  'Junonia Volute',
  'Megalodon Shark Tooth',
  'Queen Conch',
  'Stony Coral Fragment',
  'Calico Scallop',
  'Keyhole Sand Dollar',
  'Lightning Whelk',
  'Snaggletooth Shark Tooth',
];

export const FindSpotTab: React.FC<FindSpotTabProps> = ({ savedFinds, apiKey }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SpotLocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Load current location on mount to inform user
  useEffect(() => {
    let isMounted = true;
    setIsLocating(true);
    getCurrentBeachLocation().then((loc) => {
      if (isMounted) {
        setLocation(loc);
        setIsLocating(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Build shortcut list: combines saved species with defaults
  const savedSpeciesNames = Array.from(
    new Set(
      savedFinds
        .map((f) => f.identification?.commonName?.trim())
        .filter((name): name is string => Boolean(name && name !== 'Non-Specimen Object' && name !== 'Unidentified Rock/Debris'))
    )
  );

  // Combine saved first, then fill with default shortcuts up to ~10
  const allShortcuts = Array.from(new Set([...savedSpeciesNames, ...DEFAULT_SHORTCUTS]));

  const handleSearch = async (speciesToSearch?: string) => {
    const query = (speciesToSearch || searchTerm).trim();
    if (!query) return;

    setSearchTerm(query);
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Fetch fresh coordinates if available
    let currentLoc = location;
    if (!currentLoc?.latitude) {
      currentLoc = await getCurrentBeachLocation();
      setLocation(currentLoc);
    }

    try {
      const response = await fetch('/api/find-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-gemini-key': apiKey } : {}),
        },
        body: JSON.stringify({
          speciesName: query,
          lat: currentLoc?.latitude,
          lon: currentLoc?.longitude,
          customApiKey: apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const mainErr = data.error || 'Failed to search for locations.';
        const detailedErr = data.details ? ` — ${data.details}` : '';
        throw new Error(`${mainErr}${detailedErr}`);
      }

      setResult({
        speciesName: data.speciesName,
        guide: data.guide,
        isGrounded: Boolean(data.isGrounded),
        sources: data.sources || [],
        searchQueries: data.searchQueries || [],
        userLocation: data.userLocation,
      });

      // Smooth scroll down to result
      setTimeout(() => {
        const el = document.getElementById('find-spot-results');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Find Spot Error:', err);
      setError(err?.message || 'Unable to retrieve location guide. Please try again or check settings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#FAF6ED] rounded-2xl border-2 border-[#16393D] p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#8FBBAA]/30 text-[#16393D] border border-[#8FBBAA]/60">
                FIELD HABITAT MAPPER
              </span>
              {result && !result.isGrounded ? (
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#B44C33] bg-[#E5A882]/20 px-2 py-0.5 rounded border border-[#B44C33]/40 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-[#B44C33]" /> General Knowledge — Not Independently Verified
                </span>
              ) : (
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#16393D]/70 bg-[#8FBBAA]/30 px-2 py-0.5 rounded border border-[#8FBBAA]/60 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#16393D]" /> Web Search Grounded
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-[#16393D] tracking-tight">
              Find a Spot
            </h2>
            <p className="text-xs sm:text-sm font-sans text-[#16393D]/80">
              Reverse lookup from species name to likely coastal hotspots, ideal tide stages, and legal collection restrictions.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#16393D] flex items-center justify-center text-[#FAF6ED] shrink-0 border-2 border-[#8FBBAA] shadow-xs">
            <MapPin className="w-6 h-6 text-[#8FBBAA]" />
          </div>
        </div>

        {/* Location Bias Status Badge */}
        <div className="bg-[#F0EAD9] p-3 rounded-xl border border-[#16393D]/20 flex items-center justify-between gap-3 text-xs font-sans text-[#16393D]">
          <div className="flex items-center gap-2 min-w-0">
            <Compass className="w-4 h-4 text-[#D9A87E] shrink-0" />
            <span className="truncate">
              {isLocating ? (
                'Detecting beach location...'
              ) : location?.beachName ? (
                <>
                  <strong className="font-bold">Regional Bias Active:</strong> {location.beachName}
                </>
              ) : (
                'Location coordinates inactive (searches global hotspots)'
              )}
            </span>
          </div>

          {location?.latitude !== undefined && location?.longitude !== undefined && (
            <span className="text-[10px] font-mono text-[#16393D]/70 shrink-0 bg-[#FAF6ED] px-2 py-0.5 rounded border border-[#16393D]/10">
              {location.latitude}° N, {Math.abs(location.longitude)}° W
            </span>
          )}
        </div>

        {/* Search Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-3 pt-2"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16393D]/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter species (e.g. Junonia, Megalodon Tooth, Stony Coral)..."
                className="w-full bg-white border-2 border-[#16393D]/40 focus:border-[#16393D] rounded-xl pl-11 pr-4 py-3 text-sm font-sans font-semibold text-[#16393D] placeholder-[#16393D]/40 outline-none transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#16393D]/50 hover:text-[#16393D] p-1"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !searchTerm.trim()}
              className="py-3 px-6 bg-[#16393D] text-[#FAF6ED] hover:bg-[#16393D]/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-sans font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#8FBBAA]" />
                  Searching Web...
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-[#8FBBAA]" />
                  Find Best Spots
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Select Shortcuts from My Finds & Defaults */}
        <div className="space-y-2 pt-1 border-t border-[#16393D]/10">
          <div className="flex items-center justify-between text-[11px] font-sans font-bold text-[#16393D]/70">
            <span className="flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#D9A87E]" /> Quick-Select Species Shortcuts:
            </span>
            {savedSpeciesNames.length > 0 && (
              <span className="text-[10px] text-[#16393D]/60 flex items-center gap-1 font-normal">
                <Bookmark className="w-3 h-3 text-[#16393D]" /> Includes your saved finds
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {allShortcuts.map((specimenName) => {
              const isSaved = savedSpeciesNames.includes(specimenName);
              const isSelected = searchTerm.toLowerCase() === specimenName.toLowerCase();

              return (
                <button
                  key={specimenName}
                  type="button"
                  onClick={() => {
                    setSearchTerm(specimenName);
                    handleSearch(specimenName);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#16393D] text-[#FAF6ED] border-[#16393D] shadow-xs'
                      : isSaved
                      ? 'bg-[#8FBBAA]/30 text-[#16393D] border-[#8FBBAA] hover:bg-[#8FBBAA]/50'
                      : 'bg-white text-[#16393D]/80 border-[#16393D]/20 hover:bg-[#F0EAD9] hover:border-[#16393D]/40'
                  }`}
                >
                  {isSaved && <Bookmark className="w-3 h-3 text-[#16393D] shrink-0" />}
                  <span>{specimenName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-[#D98C93]/20 border-2 border-[#D98C93] text-[#16393D] rounded-xl text-xs font-sans font-semibold flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-[#D98C93] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Search Failed</p>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton & Status Indicator */}
      {isLoading && (
        <div className="bg-[#FAF6ED] rounded-2xl border-2 border-[#16393D] p-8 text-center space-y-4 shadow-sm animate-pulse">
          <div className="w-12 h-12 bg-[#8FBBAA]/30 rounded-full flex items-center justify-center mx-auto text-[#16393D]">
            <Compass className="w-6 h-6 animate-spin text-[#16393D]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold font-display text-[#16393D]">
              Searching Coastal Biodiversity Databases & Web Records...
            </h3>
            <p className="text-xs font-sans text-[#16393D]/70 max-w-md mx-auto">
              Gathering grounded data for "{searchTerm}" — mapping known beach deposits, tide conditions, and collection rules.
            </p>
          </div>

          <div className="max-w-xs mx-auto space-y-2 pt-2">
            <div className="h-3 bg-[#16393D]/10 rounded-full w-full" />
            <div className="h-3 bg-[#16393D]/10 rounded-full w-4/5 mx-auto" />
            <div className="h-3 bg-[#16393D]/10 rounded-full w-2/3 mx-auto" />
          </div>
        </div>
      )}

      {/* Location Results Section */}
      {result && !isLoading && (
        <div id="find-spot-results" className="space-y-6">
          {/* Framed Result Card */}
          <div className="bg-[#FAF6ED] rounded-2xl border-2 border-[#16393D] p-6 sm:p-8 shadow-md space-y-6">
            {/* Header / Disclaimer Badge */}
            <div className="space-y-3 border-b-2 border-[#16393D]/15 pb-5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-[#16393D] text-[#FAF6ED]">
                  LOCATION GUIDE RESULT
                </span>

                {result.isGrounded ? (
                  <span className="text-xs font-sans font-bold text-[#16393D] bg-[#8FBBAA]/30 px-2.5 py-0.5 rounded border border-[#8FBBAA]/60 flex items-center gap-1 shadow-xs">
                    <Globe className="w-3.5 h-3.5 text-[#16393D]" /> Grounded Web Search
                  </span>
                ) : (
                  <span className="text-xs font-sans font-bold text-[#B44C33] bg-[#E5A882]/25 px-2.5 py-0.5 rounded border border-[#B44C33]/50 flex items-center gap-1 shadow-xs">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#B44C33]" /> General Knowledge — Not Independently Verified
                  </span>
                )}
              </div>

              <h3 className="text-2xl sm:text-3xl font-black font-display text-[#16393D] tracking-tight">
                Where to Find: {result.speciesName}
              </h3>

              {/* General Guidance Disclaimer Box */}
              <div className="bg-[#F0EAD9] border border-[#16393D]/30 p-3.5 rounded-xl text-xs font-sans text-[#16393D]/90 flex items-start gap-2.5 shadow-xs">
                <Info className="w-4 h-4 text-[#D9A87E] shrink-0 mt-0.5" />
                <p>
                  <strong className="font-bold text-[#16393D]">Field Note:</strong> Locations represent general known habitat patterns and historical beachcombing records. Tides, storm shifts, and seasonal erosion change daily yield.
                </p>
              </div>
            </div>

            {/* Markdown Body Content */}
            <div className="prose prose-stone max-w-none text-[#16393D] font-sans text-sm sm:text-base leading-relaxed space-y-4">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-lg sm:text-xl font-black font-display text-[#16393D] border-b border-[#16393D]/20 pb-1 mt-6 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#D9A87E] inline" /> {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-bold font-display text-[#16393D] mt-4 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-xs sm:text-sm text-[#16393D]/90 leading-relaxed mb-3">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-2 my-2 text-xs sm:text-sm list-disc list-inside text-[#16393D]/90">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed pl-1">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-[#16393D]">{children}</strong>
                  ),
                }}
              >
                {result.guide}
              </ReactMarkdown>
            </div>

            {/* Web Grounding Sources & Citations */}
            {result.sources && result.sources.length > 0 && (
              <div className="pt-6 border-t-2 border-[#16393D]/15 space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#16393D]" />
                  <h4 className="text-xs font-bold font-sans uppercase tracking-wider text-[#16393D]">
                    Grounded Web Sources & References
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white border border-[#16393D]/20 hover:border-[#16393D] rounded-xl text-xs font-sans font-semibold text-[#16393D] flex items-center justify-between gap-2 hover:bg-[#F0EAD9] transition-all group shadow-xs"
                    >
                      <span className="truncate group-hover:underline">
                        {src.title || src.url}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#16393D]/60 group-hover:text-[#16393D] shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

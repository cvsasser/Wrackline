import React, { useState } from 'react';
import { ShellIdentification, LocationInfo } from '../types';
import { AlertTriangle, Bookmark, Check, Info, Share2, Compass, ShieldAlert, SearchX, Eye, Sparkles, RefreshCw } from 'lucide-react';

interface SpecimenCardProps {
  photoUrl: string;
  identification: ShellIdentification;
  location: LocationInfo;
  onSaveFind: (userNotes: string) => void;
  isSaved?: boolean;
  onResetScan?: () => void;
}

export const SpecimenCard: React.FC<SpecimenCardProps> = ({
  photoUrl,
  identification,
  location,
  onSaveFind,
  isSaved = false,
  onResetScan,
}) => {
  const [userNotes, setUserNotes] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const {
    visualAnalysis,
    isValidSpecimen,
    isValidShell,
    specimenType,
    commonName,
    commonAliases = [],
    scientificName,
    family,
    confidence,
    rarity,
    habitatNote,
    funFact,
    isProtectedSpecies,
    protectedNote,
    alternateMatches = [],
  } = identification;

  const isSpecimenValid = isValidSpecimen ?? isValidShell ?? true;

  // Handle Non-Specimen Objects Gracefully (isSpecimenValid === false)
  if (!isSpecimenValid) {
    return (
      <div className="bg-[#FAF6ED] rounded-2xl border-2 border-[#16393D] p-6 sm:p-10 max-w-2xl mx-auto shadow-lg text-center space-y-6 my-4 relative">
        <div className="w-16 h-16 bg-[#D98C93]/20 border border-[#D98C93] rounded-full flex items-center justify-center mx-auto text-[#D98C93] shadow-xs">
          <SearchX className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#D98C93]">
            NON-SPECIMEN DETECTED
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#16393D] tracking-tight">
            Doesn't look like a valid beachcombing specimen (shell, coral, or shark tooth) — want to try another photo?
          </h2>
          {visualAnalysis && (
            <div className="bg-white/80 p-3.5 rounded-xl border border-[#16393D]/20 text-xs text-[#16393D]/90 font-serif text-left italic">
              <strong>AI Visual Inspection:</strong> {visualAnalysis}
            </div>
          )}
        </div>

        {/* Captured photo preview */}
        <div className="w-48 h-36 bg-stone-200 rounded-xl overflow-hidden border-2 border-[#16393D]/30 mx-auto shadow-inner">
          <img src={photoUrl} alt="Captured non-specimen object" className="w-full h-full object-cover" />
        </div>

        {/* Helpful Photography Tips */}
        <div className="bg-[#F0EAD9] p-4 rounded-xl border border-[#16393D]/20 text-left text-xs font-sans space-y-2 max-w-md mx-auto">
          <p className="font-bold text-[#16393D] uppercase tracking-wide text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#8FBBAA]" /> Best Practices for Specimen Identification:
          </p>
          <ul className="space-y-1 text-[#16393D]/80 list-disc list-inside text-[11px]">
            <li>Place a single intact shell, coral piece, or shark tooth on a plain, uncluttered surface.</li>
            <li>Take Shot 1 facing straight down to show silhouette & surface texture.</li>
            <li>Take Shot 2 tilted to reveal root structure, aperture curve, or coral pores.</li>
            <li>Avoid heavy shadows or multiple scattered rocks/debris in the frame.</li>
          </ul>
        </div>

        {/* Action Button */}
        {onResetScan && (
          <button
            onClick={onResetScan}
            className="py-3.5 px-6 bg-[#16393D] text-[#FAF6ED] hover:bg-[#16393D]/90 rounded-xl font-sans font-bold uppercase text-xs tracking-widest shadow transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-[#8FBBAA]" />
            Scan Another Specimen
          </button>
        )}
      </div>
    );
  }

  const confidencePct = Math.round(confidence * 100);

  // Specimen type badge
  const getSpecimenTypeBadge = (type?: string) => {
    switch (type) {
      case 'coral':
        return { label: 'CORAL', bg: 'bg-[#E39882]', text: 'text-[#16393D]' };
      case 'sharkTooth':
        return { label: 'SHARK TOOTH', bg: 'bg-[#16393D]', text: 'text-[#FAF6ED]' };
      case 'seashell':
        return { label: 'SHELL', bg: 'bg-[#D9A87E]', text: 'text-[#16393D]' };
      default:
        return { label: 'SPECIMEN', bg: 'bg-[#16393D]/80', text: 'text-[#FAF6ED]' };
    }
  };

  // Rarity color mappings
  const getRarityBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'rare':
        return { bg: 'bg-[#D98C93]', text: 'text-white', border: 'border-[#16393D]', label: '★ RARE FIND' };
      case 'uncommon':
        return { bg: 'bg-[#D9A87E]', text: 'text-[#16393D]', border: 'border-[#16393D]', label: '◆ UNCOMMON' };
      case 'common':
        return { bg: 'bg-[#8FBBAA]', text: 'text-[#16393D]', border: 'border-[#16393D]', label: '● COMMON' };
      default:
        return { bg: 'bg-[#C5B899]', text: 'text-[#16393D]', border: 'border-[#16393D]', label: 'UNSPECIFIED' };
    }
  };

  const rarityInfo = getRarityBadge(rarity);
  const typeInfo = getSpecimenTypeBadge(specimenType);

  const handleSave = () => {
    onSaveFind(userNotes);
    setJustSaved(true);
  };

  const handleShare = () => {
    const text = `Beachcombing Specimen Tag: ${commonName} (${scientificName}) identified on Wrackline! Rarity: ${rarity.toUpperCase()}.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-sm border-2 border-dashed border-[#16393D] p-6 sm:p-10 max-w-3xl mx-auto shadow-lg relative flex flex-col my-4">
      {/* Central Punch Hole Accent */}
      <div className="w-4 h-4 rounded-full bg-[#F0EAD9] border-2 border-[#16393D] absolute top-6 left-1/2 -translate-x-1/2 z-10" />

      {/* Protected Species RED WARNING BANNER across top if applicable */}
      {isProtectedSpecies && (
        <div className="bg-[#D98C93] text-white py-2.5 px-6 -mx-6 sm:-mx-10 -mt-2 sm:-mt-6 mb-8 flex items-center justify-center gap-2.5 font-sans font-bold uppercase tracking-widest text-xs sm:text-sm shadow-sm">
          <ShieldAlert className="w-5 h-5 text-white shrink-0" />
          <span>Protected Species: Collection Strictly Prohibited</span>
        </div>
      )}

      {/* Top Header: Common Name, Scientific Name, Rarity */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6 pb-4 border-b border-[#16393D]/20">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-50 block mb-1">
            Family: {family}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#16393D] leading-tight">
            {commonName}
          </h2>
          <p className="italic font-serif text-lg text-[#16393D]/80 mt-0.5">
            {scientificName}
          </p>

          {commonAliases && commonAliases.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] font-sans font-medium text-[#16393D]/70">
                Also known as:
              </span>
              {commonAliases.map((alias, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 bg-[#F0EAD9] border border-[#16393D]/30 text-[#16393D] rounded-full text-[11px] font-sans font-semibold"
                >
                  {alias}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="sm:text-right shrink-0 flex flex-col items-start sm:items-end gap-1">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-50 block">
            Classification & Rarity
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-1 ${typeInfo.bg} ${typeInfo.text} border border-[#16393D] rounded font-sans font-bold text-xs uppercase tracking-wider shadow-xs`}>
              {typeInfo.label}
            </span>
            <span className={`px-3 py-1 ${rarityInfo.bg} ${rarityInfo.text} border border-[#16393D] rounded font-sans font-bold text-xs uppercase tracking-wider shadow-xs`}>
              {rarityInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Main Specimen Grid: Captured Image & Key Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6">
        {/* Photo Box */}
        <div className="aspect-4/3 bg-[#F0EAD9] rounded-md border-2 border-[#16393D] overflow-hidden relative shadow-inner p-1.5 flex flex-col justify-between">
          <img
            src={photoUrl}
            alt={commonName}
            className="w-full h-full object-cover rounded"
          />
          <div className="absolute bottom-2 left-2 right-2 bg-[#16393D]/90 text-[#FAF6ED] px-2.5 py-1 rounded text-[10px] font-sans font-bold uppercase tracking-wider flex items-center justify-between">
            <span className="truncate">{location.beachName || 'Beach Tide Line'}</span>
            <Compass className="w-3.5 h-3.5 text-[#8FBBAA]" />
          </div>
        </div>

        {/* Identification Metadata */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Confidence Meter Box */}
          <div className="p-4 bg-[#F0EAD9] rounded-lg border border-[#16393D] space-y-2">
            <p className="text-xs font-sans font-bold uppercase opacity-60">
              Identification Confidence
            </p>
            <div className="flex items-center gap-3">
              <div className="h-2.5 flex-1 bg-white rounded-full overflow-hidden border border-[#16393D]/30">
                <div
                  className="h-full bg-[#16393D] transition-all duration-700"
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
              <span className="font-sans font-bold text-sm text-[#16393D]">
                {confidencePct}%
              </span>
            </div>
            <p className="text-[11px] text-[#16393D]/70 font-serif italic pt-1">
              {confidence >= 0.85
                ? 'High certainty match with known conchological records.'
                : 'Moderate certainty. Review alternate candidates.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[#F0EAD9] rounded border border-[#16393D]">
              <p className="font-bold uppercase text-[10px] opacity-50 font-sans mb-1">Taxonomic Family</p>
              <p className="text-sm font-semibold text-[#16393D] font-serif">{family}</p>
            </div>
            <div className="p-3 bg-[#F0EAD9] rounded border border-[#16393D]">
              <p className="font-bold uppercase text-[10px] opacity-50 font-sans mb-1">GPS Beach Tag</p>
              <p className="text-sm font-semibold text-[#16393D] truncate font-sans" title={location.beachName}>
                {location.beachName || 'Coastal Zone'}
              </p>
              {location.latitude !== undefined && location.longitude !== undefined && (
                <p className="text-[10px] text-[#16393D]/70 font-mono mt-0.5 truncate">
                  {location.latitude}° N, {Math.abs(location.longitude)}° W
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analysis Reasoning Section */}
      {visualAnalysis && (
        <div className="mb-6 p-4 bg-[#F0EAD9]/80 border border-[#16393D]/30 rounded-xl space-y-1.5">
          <h5 className="text-xs font-sans font-bold uppercase tracking-wider text-[#16393D] flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#16393D]" />
            Conchological Visual Analysis
          </h5>
          <p className="text-xs sm:text-sm leading-relaxed text-[#16393D]/90 font-serif italic">
            "{visualAnalysis}"
          </p>
        </div>
      )}

      {/* Field Notes & Naturalist Facts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 border-t border-[#16393D]/20 pt-6 mb-6">
        <div className="space-y-2">
          <h5 className="text-xs font-sans font-bold uppercase tracking-wider text-[#16393D] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#16393D]" />
            Field & Habitat Notes
          </h5>
          <p className="text-xs sm:text-sm leading-relaxed text-[#16393D]/90 font-serif">
            {habitatNote}
          </p>
        </div>

        <div className="space-y-2">
          <h5 className="text-xs font-sans font-bold uppercase tracking-wider text-[#16393D] flex items-center gap-1.5">
            <ShellIdentificationIcon className="w-3.5 h-3.5 text-[#16393D]" />
            Naturalist Observation
          </h5>
          <p className="text-xs sm:text-sm leading-relaxed font-sans italic text-[#16393D]/90">
            {funFact}
          </p>
        </div>
      </div>

      {/* Protected species specific note detail if warning exists */}
      {isProtectedSpecies && protectedNote && (
        <div className="mb-6 p-3 bg-[#D98C93]/15 border border-[#D98C93] rounded text-xs font-sans text-[#16393D]">
          <strong className="font-bold uppercase tracking-wide block mb-0.5 text-[#D98C93]">Conservation Notice:</strong>
          {protectedNote}
        </div>
      )}

      {/* Alternate Candidate Matches if present */}
      {alternateMatches.length > 0 && (
        <div className="mb-6 border border-[#16393D]/30 bg-[#F0EAD9]/60 rounded-lg p-4">
          <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#16393D] mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#D9A87E]" />
            Alternate Morphological Candidates
          </h4>

          <div className="space-y-2">
            {alternateMatches.map((alt, idx) => (
              <div
                key={idx}
                className="bg-white p-2.5 rounded border border-[#16393D]/20 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              >
                <div>
                  <span className="font-bold text-[#16393D]">{alt.commonName}</span>{' '}
                  <span className="italic font-serif text-[#16393D]/80">({alt.scientificName})</span>
                  <p className="text-[11px] text-[#16393D]/70 mt-0.5 font-sans">
                    <strong>Distinguishing Feature:</strong> {alt.distinguishingFeature}
                  </p>
                </div>

                <span className="font-sans font-bold text-[11px] bg-[#16393D]/10 px-2 py-0.5 rounded text-[#16393D] shrink-0">
                  {Math.round(alt.confidence * 100)}% Match
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Notes Entry & Action Buttons */}
      <div className="border-t border-[#16393D]/20 pt-6 mt-auto space-y-4">
        {!isSaved && !justSaved && (
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#16393D] mb-1">
              Field Collector Notes
            </label>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Record weather, tide, beach location, or companion notes..."
              rows={2}
              className="w-full p-2.5 bg-[#F0EAD9] border border-[#16393D] rounded text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#16393D]"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSave}
            disabled={isSaved || justSaved}
            className={`flex-1 py-4 px-6 rounded font-sans font-bold uppercase text-xs tracking-widest shadow transition-all flex items-center justify-center gap-2 ${
              isSaved || justSaved
                ? 'bg-[#8FBBAA] text-[#16393D] cursor-default'
                : 'bg-[#16393D] text-[#F0EAD9] hover:bg-[#16393D]/90 active:scale-[0.99]'
            }`}
          >
            {isSaved || justSaved ? (
              <>
                <Check className="w-4 h-4 text-[#16393D]" />
                Saved in My Finds Logbook
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-[#8FBBAA]" />
                Save to My Finds
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="px-6 py-4 border-2 border-[#16393D] bg-white hover:bg-[#F0EAD9] text-[#16393D] rounded font-sans font-bold uppercase text-xs tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {copiedShare ? 'Copied' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
};

function ShellIdentificationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}

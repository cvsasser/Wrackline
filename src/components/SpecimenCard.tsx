import React, { useState } from 'react';
import { ShellIdentification, LocationInfo } from '../types';
import { AlertTriangle, Bookmark, MapPin, Check, Info, Share2, Compass, ShieldAlert } from 'lucide-react';

interface SpecimenCardProps {
  photoUrl: string;
  identification: ShellIdentification;
  location: LocationInfo;
  onSaveFind: (userNotes: string) => void;
  isSaved?: boolean;
}

export const SpecimenCard: React.FC<SpecimenCardProps> = ({
  photoUrl,
  identification,
  location,
  onSaveFind,
  isSaved = false,
}) => {
  const [userNotes, setUserNotes] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const {
    commonName,
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

  const confidencePct = Math.round(confidence * 100);

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
        </div>

        <div className="sm:text-right shrink-0">
          <span className="text-xs font-sans font-bold uppercase opacity-50 block mb-1">
            Rarity
          </span>
          <span className="px-3.5 py-1 bg-[#8FBBAA] text-[#16393D] border border-[#16393D] rounded font-sans font-bold text-xs uppercase tracking-wider shadow-xs">
            {rarityInfo.label}
          </span>
        </div>
      </div>

      {/* Main Specimen Grid: Captured Image & Key Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
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
              <p className="text-sm font-semibold text-[#16393D] truncate font-sans">
                {location.beachName || 'Coastal Zone'}
              </p>
            </div>
          </div>
        </div>
      </div>

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

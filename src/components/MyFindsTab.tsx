import React, { useState } from 'react';
import { SavedFind } from '../types';
import { Trash2, Search, Calendar, MapPin, ExternalLink, ShieldAlert, BookMarked, Download, Eye, X } from 'lucide-react';
import { SpecimenCard } from './SpecimenCard';

interface MyFindsTabProps {
  finds: SavedFind[];
  onDeleteFind: (id: string) => void;
  onNavigateToScan: () => void;
}

export const MyFindsTab: React.FC<MyFindsTabProps> = ({
  finds,
  onDeleteFind,
  onNavigateToScan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [selectedFind, setSelectedFind] = useState<SavedFind | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtering
  const filteredFinds = finds.filter((find) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      find.identification.commonName.toLowerCase().includes(query) ||
      find.identification.scientificName.toLowerCase().includes(query) ||
      find.identification.family.toLowerCase().includes(query) ||
      (find.location.beachName && find.location.beachName.toLowerCase().includes(query)) ||
      (find.userNotes && find.userNotes.toLowerCase().includes(query));

    if (!matchesQuery) return false;

    if (rarityFilter === 'all') return true;
    if (rarityFilter === 'protected') return find.identification.isProtectedSpecies;
    return find.identification.rarity.toLowerCase() === rarityFilter;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingId === id) {
      onDeleteFind(id);
      setDeletingId(null);
      if (selectedFind?.id === id) {
        setSelectedFind(null);
      }
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 3000); // Reset confirm state after 3s
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(finds, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Wrackline_Beach_Finds_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar for My Finds */}
      <div className="bg-white rounded-xl border-2 border-[#16393D] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-60 text-[#16393D] block mb-1">
            SPECIMEN LOGBOOK
          </span>
          <h2 className="text-2xl font-black font-display text-[#16393D]">
            My Beachcombing Finds ({finds.length})
          </h2>
          <p className="text-xs text-[#16393D]/80 font-sans">
            Personal logbook of verified seashell identifications and tide tags
          </p>
        </div>

        {finds.length > 0 && (
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-[#FAF6ED] border-2 border-[#16393D] hover:bg-[#16393D] hover:text-[#FAF6ED] text-[#16393D] text-xs font-sans font-bold rounded-full transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Logbook (.JSON)
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      {finds.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#16393D]/50 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search common name, scientific name, or location..."
              className="w-full pl-10 pr-3 py-2 bg-white border-2 border-[#16393D]/30 rounded-xl text-xs font-sans text-[#16393D] focus:outline-none focus:border-[#16393D]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'common', 'uncommon', 'rare', 'protected'].map((filter) => (
              <button
                key={filter}
                onClick={() => setRarityFilter(filter)}
                className={`px-4 py-2 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  rarityFilter === filter
                    ? 'bg-[#16393D] text-[#FAF6ED] shadow-xs'
                    : 'bg-white text-[#16393D]/80 hover:bg-[#8FBBAA]/20 border border-[#16393D]/30'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {finds.length === 0 ? (
        <div className="bg-[#8FBBAA]/20 rounded-3xl border-2 border-[#8FBBAA] p-10 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-[#16393D] border-2 border-[#8FBBAA] rounded-full flex items-center justify-center mx-auto text-[#F0EAD9]">
            <BookMarked className="w-8 h-8 text-[#8FBBAA]" />
          </div>

          <div>
            <h3 className="text-xl font-bold font-display text-[#16393D]">
              No Saved Finds Yet
            </h3>
            <p className="text-xs text-[#16393D]/80 font-sans mt-1 max-w-xs mx-auto">
              Scan a seashell photo or select a sample specimen to start building your personal conchology field collection.
            </p>
          </div>

          <button
            onClick={onNavigateToScan}
            className="py-3.5 px-6 bg-[#16393D] text-[#FAF6ED] hover:bg-[#16393D]/90 text-xs font-bold font-sans uppercase tracking-widest rounded-xl shadow transition-transform active:scale-95"
          >
            Scan First Shell Now
          </button>
        </div>
      ) : filteredFinds.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-[#16393D]/20">
          <p className="text-sm font-bold font-sans text-[#16393D]">No matching specimens found</p>
          <p className="text-xs text-[#16393D]/70 font-sans mt-1">
            Try adjusting your search query or filter selection.
          </p>
        </div>
      ) : (
        /* Saved Specimens Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFinds.map((find) => {
            const dateStr = new Date(find.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={find.id}
                onClick={() => setSelectedFind(find)}
                className="bg-white rounded-xl border-2 border-[#16393D] p-4 cursor-pointer hover:shadow-md transition-all relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg border-2 border-[#16393D] overflow-hidden bg-[#F0EAD9] shrink-0 relative">
                      <img
                        src={find.photoUrl}
                        alt={find.identification.commonName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Specimen Brief */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#16393D]/60">
                          {find.identification.rarity}
                        </span>

                        {find.identification.isProtectedSpecies && (
                          <span className="bg-[#D98C93] text-white text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <ShieldAlert className="w-2.5 h-2.5" /> PROTECTED
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold font-serif text-[#16393D] truncate leading-snug">
                        {find.identification.commonName}
                      </h3>
                      <p className="text-xs font-serif italic text-[#16393D]/80 truncate">
                        {find.identification.scientificName}
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-[11px] font-sans text-[#16393D]/70">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                      </div>
                    </div>
                  </div>

                  {find.userNotes && (
                    <p className="mt-3 text-xs bg-[#F0EAD9] p-2.5 rounded border border-[#16393D]/20 text-[#16393D]/90 font-serif italic line-clamp-2">
                      "{find.userNotes}"
                    </p>
                  )}
                </div>

                {/* Footer Bar: Location & Actions */}
                <div className="mt-3 pt-2.5 border-t border-[#16393D]/20 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-[#16393D]/80 truncate flex items-center gap-1 font-sans">
                    <MapPin className="w-3 h-3 text-[#16393D] shrink-0" />
                    {find.location.beachName || 'Beach Tag'}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFind(find);
                      }}
                      className="px-2.5 py-1 bg-[#16393D] text-[#FAF6ED] rounded font-sans text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-[#16393D]/90"
                    >
                      <Eye className="w-3 h-3" /> View Tag
                    </button>

                    <button
                      onClick={(e) => handleDelete(find.id, e)}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        deletingId === find.id
                          ? 'bg-[#D98C93] text-white font-bold px-2'
                          : 'text-[#D98C93] hover:bg-[#D98C93]/20'
                      }`}
                      title="Delete specimen"
                    >
                      {deletingId === find.id ? 'Confirm?' : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Specimen Detail Modal */}
      {selectedFind && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16393D]/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="relative max-w-2xl w-full my-8">
            <button
              onClick={() => setSelectedFind(null)}
              className="absolute -top-3 -right-3 z-10 bg-[#FAF6ED] text-[#16393D] p-2 rounded-full border-2 border-[#16393D] shadow-lg hover:bg-white transition-transform active:scale-95"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <SpecimenCard
              photoUrl={selectedFind.photoUrl}
              identification={selectedFind.identification}
              location={selectedFind.location}
              onSaveFind={() => {}}
              isSaved={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

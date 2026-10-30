import React, { useState } from 'react';
import { LocationItem, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../translations';
import { INDIAN_AGRICULTURAL_PRESETS } from '../services/weatherService';
import {
  MapPin,
  Search,
  Navigation,
  X,
  Bookmark,
  Check,
  Building,
  Wheat,
} from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationItem;
  savedLocations: LocationItem[];
  language: SupportedLanguage;
  onSelectLocation: (loc: LocationItem) => void;
  onSaveLocation: (loc: LocationItem) => void;
  onGpsDetect: () => void;
  isGpsLoading: boolean;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  savedLocations,
  language,
  onSelectLocation,
  onSaveLocation,
  onGpsDetect,
  isGpsLoading,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.Hindi;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'saved' | 'search'>('presets');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setActiveTab('search');
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const mapped: LocationItem[] = (data.results || []).map((r: any) => ({
          id: `geo_${r.latitude}_${r.longitude}`,
          name: `${r.name}${r.admin1 ? `, ${r.admin1}` : ''}`,
          district: r.admin2 || r.admin1,
          state: r.admin1,
          lat: r.latitude,
          lon: r.longitude,
          label: r.country_code === 'IN' ? 'India' : r.country,
        }));
        setSearchResults(mapped);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-md animate-in fade-in duration-150">
      <div className="glass-modal rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Frosted Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/90 via-emerald-900/85 to-emerald-950/90 backdrop-blur-xl text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-300 text-emerald-950 flex items-center justify-center font-bold text-lg shadow-md border border-amber-200">
              📍
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">{t.selectLocation}</h3>
              <p className="text-xs text-emerald-200/90">
                {language === 'Hindi'
                  ? 'गाँव, ज़िला, पिन कोड या जीपीएस से चुनें'
                  : 'Search village, district, PIN code or GPS'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Quick Button & Search Bar */}
        <div className="p-4 border-b border-stone-200/60 bg-white/50 backdrop-blur-md space-y-3">
          <button
            onClick={() => {
              onGpsDetect();
              onClose();
            }}
            disabled={isGpsLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Navigation className={`w-4 h-4 ${isGpsLoading ? 'animate-spin' : ''}`} />
            <span>{t.gpsDetect}</span>
          </button>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchVillageOrPin}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl glass-input font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
            >
              {isSearching
                ? (language === 'Hindi' ? 'खोज रहे...' : 'Searching...')
                : (language === 'Hindi' ? 'खोजें' : 'Search')}
            </button>
          </form>
        </div>

        {/* Tabs: Presets, Saved Fields, Search Results */}
        <div className="flex border-b border-stone-200 bg-white px-4 text-xs font-bold text-stone-600">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'presets'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            🌾 {language === 'Hindi' ? 'प्रमुख कृषि क्षेत्र' : 'Agri Hubs'}
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'saved'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            ⭐ {language === 'Hindi' ? 'सहेजे गए स्थान' : 'Saved'} ({savedLocations.length})
          </button>
          {searchResults.length > 0 && (
            <button
              onClick={() => setActiveTab('search')}
              className={`py-2.5 px-3 border-b-2 transition-all ${
                activeTab === 'search'
                  ? 'border-emerald-700 text-emerald-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              🔍 {language === 'Hindi' ? 'खोज परिणाम' : 'Results'} ({searchResults.length})
            </button>
          )}
        </div>

        {/* Scrollable Locations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'presets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INDIAN_AGRICULTURAL_PRESETS.map((loc) => {
                const isSelected = currentLocation.name.includes(loc.name.split(' ')[0]);
                return (
                  <div
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{loc.name}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {loc.state} • {loc.label}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-2">
              {savedLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className="p-3 rounded-2xl border border-stone-200 hover:border-emerald-400 bg-stone-50 hover:bg-emerald-50/50 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🏡</span>
                    <div>
                      <div className="text-xs font-bold text-stone-900">
                        {loc.label ? `${loc.label} - ${loc.name}` : loc.name}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {loc.district ? `${loc.district}, ` : ''}{loc.state || 'India'}
                      </div>
                    </div>
                  </div>
                  {currentLocation.id === loc.id && (
                    <Check className="w-4 h-4 text-emerald-700" />
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-2">
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-stone-500 text-xs font-medium">
                  {language === 'Hindi'
                    ? 'कोई परिणाम नहीं मिला। कृपया पिन कोड या नज़दीकी शहर का नाम लिखें।'
                    : 'No matching location found. Try entering PIN code or district.'}
                </div>
              ) : (
                searchResults.map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      onSaveLocation(loc);
                      onClose();
                    }}
                    className="p-3 rounded-2xl border border-stone-200 hover:border-emerald-500 bg-stone-50 hover:bg-emerald-50/60 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-900">{loc.name}</div>
                      <div className="text-[11px] text-stone-500">
                        {loc.district ? `${loc.district}, ` : ''}{loc.state || ''}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaveLocation(loc);
                      }}
                      className="text-xs font-bold text-emerald-800 hover:underline px-2 py-1"
                    >
                      {language === 'Hindi' ? 'सहेजें' : 'Save'}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

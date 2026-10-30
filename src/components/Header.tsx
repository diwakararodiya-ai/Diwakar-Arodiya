import React from 'react';
import { LocationItem, SupportedLanguage, UserProfile } from '../types';
import { TRANSLATIONS, LANGUAGE_METADATA } from '../translations';
import { MapPin, Globe, Navigation, WifiOff, User } from 'lucide-react';
import { AndroidInstallBanner } from './AndroidInstallBanner';

interface HeaderProps {
  currentLocation: LocationItem;
  language: SupportedLanguage;
  isOffline: boolean;
  user: UserProfile | null;
  onOpenLocationModal: () => void;
  onOpenLanguageModal: () => void;
  onOpenLoginModal: () => void;
  onGpsDetect: () => void;
  isGpsLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  language,
  isOffline,
  user,
  onOpenLocationModal,
  onOpenLanguageModal,
  onOpenLoginModal,
  onGpsDetect,
  isGpsLoading,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.Hindi;
  const currentLangMeta = LANGUAGE_METADATA[language] || LANGUAGE_METADATA.Hindi;

  return (
    <header className="sticky top-0 z-30 bg-emerald-950/80 backdrop-blur-2xl text-white shadow-lg shadow-emerald-950/15 border-b border-emerald-400/20 transition-all">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-emerald-950 flex items-center justify-center font-bold text-lg shadow-sm ring-1 ring-white/50 shrink-0">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight leading-none text-white">
                {t.appTitle}
              </h1>
              {isOffline && (
                <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-full font-bold border border-amber-400/30 backdrop-blur-md">
                  <WifiOff className="w-2.5 h-2.5" />
                  {t.offlineCache}
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-200/85 font-medium hidden sm:block mt-0.5 tracking-tight">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls: Location & Language with Frosted Glass Styling */}
        <div className="flex items-center gap-2">
          {/* Quick GPS detect button */}
          <button
            onClick={onGpsDetect}
            disabled={isGpsLoading}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-all backdrop-blur-md border border-white/15 flex items-center justify-center active:scale-95 shadow-sm cursor-pointer"
            title={t.gpsDetect}
            aria-label={t.gpsDetect}
          >
            <Navigation className={`w-4 h-4 ${isGpsLoading ? 'animate-spin text-amber-300' : ''}`} />
          </button>

          {/* Location Picker Pill */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all backdrop-blur-md border border-white/20 max-w-[160px] sm:max-w-[230px] truncate shadow-sm hover:border-amber-400/60 active:scale-95 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">{currentLocation.name}</span>
          </button>

          {/* Android Native App Install Button */}
          <AndroidInstallBanner language={language} compact={true} />

          {/* Language Selector Pill */}
          <button
            onClick={onOpenLanguageModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-stone-950 text-xs sm:text-sm font-extrabold transition-all shadow-md shadow-amber-500/25 active:scale-95 border border-amber-200 cursor-pointer"
            title={t.changeLanguage}
          >
            <Globe className="w-3.5 h-3.5 text-stone-950" />
            <span>{currentLangMeta.nativeName}</span>
          </button>

          {/* Minimal User Login / Profile Button */}
          {user?.isLoggedIn ? (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold transition-all backdrop-blur-md border border-white/25 shadow-sm active:scale-95 cursor-pointer"
              title={language === 'Hindi' ? `${user.name} (प्रोफ़ाइल)` : `${user.name} (Profile)`}
            >
              <div className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-black text-[10px] flex items-center justify-center shrink-0">
                {user.name.trim().charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[70px] sm:max-w-[100px] truncate hidden xs:inline">{user.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-850 hover:bg-emerald-800 text-emerald-100 hover:text-white text-xs sm:text-sm font-semibold transition-all backdrop-blur-md border border-emerald-500/40 shadow-sm active:scale-95 cursor-pointer"
              title={language === 'Hindi' ? 'लॉगिन करें' : 'Sign In'}
            >
              <User className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{language === 'Hindi' ? 'लॉगिन' : 'Login'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { SupportedLanguage } from '../types';
import { LANGUAGE_METADATA, TRANSLATIONS } from '../translations';
import { Globe, Check, X } from 'lucide-react';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  isOnboarding?: boolean;
}

const LANGUAGES_LIST: SupportedLanguage[] = [
  'Hindi',
  'Marathi',
  'Kannada',
  'Telugu',
  'Tamil',
  'Bengali',
  'Gujarati',
  'Punjabi',
  'Malayalam',
  'Odia',
  'English',
];

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
  isOnboarding = false,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.Hindi;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-md animate-in fade-in duration-150">
      <div className="glass-modal rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/90 via-emerald-900/85 to-emerald-950/90 backdrop-blur-xl text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-300 text-emerald-950 flex items-center justify-center font-bold text-lg shadow-sm border border-amber-200">
              <Globe className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg tracking-tight">
                {t.selectLanguage}
              </h3>
              <p className="text-xs text-emerald-200/90">
                Choose your regional language • अपनी भाषा चुनें
              </p>
            </div>
          </div>
          {!isOnboarding && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Language Grid */}
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {LANGUAGES_LIST.map((langKey) => {
              const meta = LANGUAGE_METADATA[langKey];
              const isSelected = currentLanguage === langKey;

              return (
                <button
                  key={langKey}
                  onClick={() => {
                    onSelectLanguage(langKey);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/60 scale-[1.02]'
                      : 'glass-panel-subtle hover:bg-white text-stone-900 border-white/80 hover:border-emerald-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-base font-extrabold font-sans leading-tight ${
                        isSelected ? 'text-amber-200' : 'text-emerald-950'
                      }`}
                    >
                      {meta.nativeName}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-300 shrink-0" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-emerald-200' : 'text-stone-500'
                    }`}
                  >
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>

          {isOnboarding && (
            <div className="mt-5 text-center">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm shadow-md transition-all"
              >
                {currentLanguage === 'Hindi'
                  ? 'शुरू करें (Continue)'
                  : 'Continue to Weather'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

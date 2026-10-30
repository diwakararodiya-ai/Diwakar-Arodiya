import React, { useState } from 'react';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../translations';
import { Settings, X, Bell, Shield, Database, Info, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  onOpenLanguageModal: () => void;
  onClearCache: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onOpenLanguageModal,
  onClearCache,
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[language] || TRANSLATIONS.Hindi;

  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [sprayAlerts, setSprayAlerts] = useState(true);
  const [isCacheCleared, setIsCacheCleared] = useState(false);

  const handleClear = () => {
    onClearCache();
    setIsCacheCleared(true);
    setTimeout(() => setIsCacheCleared(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-md animate-in fade-in duration-150">
      <div className="glass-modal rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-stone-900/95 to-emerald-950/90 backdrop-blur-xl text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-sm border border-amber-200">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">{t.settings}</h3>
              <p className="text-xs text-stone-300">
                {language === 'Hindi' ? 'ऐप व मौसम प्राथमिकताएं' : 'App & Notification Preferences'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto max-h-[75vh] text-xs sm:text-sm">
          {/* Language Setting */}
          <div className="p-3.5 rounded-xl glass-panel-subtle flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-stone-900">
                {language === 'Hindi' ? 'वर्तमान भाषा (Language)' : 'Selected Language'}
              </div>
              <div className="text-xs text-stone-500 font-medium">{language}</div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenLanguageModal();
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs cursor-pointer"
            >
              {t.changeLanguage}
            </button>
          </div>

          {/* Notification Toggles */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs sm:text-sm">
              <Bell className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'Hindi' ? 'अलर्ट व सूचनाएं' : 'Weather Notifications'}</span>
            </h4>

            <label className="p-3 rounded-xl bg-stone-50/90 border border-stone-200/80 flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-semibold text-stone-800">
                  {language === 'Hindi' ? 'तेज़ बारिश व आंधी अलर्ट' : 'Severe Weather & Storm Alerts'}
                </div>
                <div className="text-[11px] text-stone-500">
                  {language === 'Hindi' ? 'IMD मानदंडों पर आधारित तत्काल चेतावनी' : 'Immediate high-priority safety warnings'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={alertsEnabled}
                onChange={(e) => setAlertsEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-xl bg-stone-50/90 border border-stone-200/80 flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-semibold text-stone-800">
                  {language === 'Hindi' ? 'कीटनाशक छिड़काव परामर्श' : 'Daily Spraying Suitability'}
                </div>
                <div className="text-[11px] text-stone-500">
                  {language === 'Hindi' ? 'हवा की गति व बारिश के अनुसार दैनिक सलाह' : 'Alerts if spraying window is unsafe'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={sprayAlerts}
                onChange={(e) => setSprayAlerts(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Data Sources and Transparency */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1 text-xs text-stone-700">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-800" />
              <span>{language === 'Hindi' ? 'विश्वसनीय मौसम स्रोत' : 'Transparent Weather Sources'}</span>
            </div>
            <p>
              • <b>Open-Meteo</b>: Real-time satellite & numerical weather model predictions.
            </p>
            <p>
              • <b>RainViewer</b>: Live Doppler radar reflectivity updated every 10 minutes.
            </p>
            <p>
              • <b>IMD Criteria</b>: India Meteorological Department thresholds for heatwaves and heavy rainfall.
            </p>
            <p>
              • <b>Gemini 3.8 Flash</b>: Grounded conversational agricultural reasoning.
            </p>
          </div>

          {/* Clear Cache */}
          <div className="pt-2 flex justify-between items-center">
            <button
              onClick={handleClear}
              className="text-xs font-semibold text-stone-600 hover:text-rose-700 underline flex items-center gap-1 cursor-pointer"
            >
              {isCacheCleared ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'Hindi' ? 'डेटा रीसेट हो गया' : 'Cache Cleared!'}</span>
                </>
              ) : (
                <span>{language === 'Hindi' ? 'ऑफ़लाइन डेटा साफ़ करें' : 'Clear Offline Cache'}</span>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-stone-900 text-white font-semibold text-xs rounded-lg cursor-pointer"
            >
              {language === 'Hindi' ? 'पूर्ण (Done)' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

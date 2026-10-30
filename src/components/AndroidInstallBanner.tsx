import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { SupportedLanguage } from '../types';
import { Download, CheckCircle, Smartphone, X, Sparkles, ShieldCheck } from 'lucide-react';

interface AndroidInstallBannerProps {
  language: SupportedLanguage;
  compact?: boolean;
}

export const AndroidInstallBanner: React.FC<AndroidInstallBannerProps> = ({
  language,
  compact = false,
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const isHindi = language === 'Hindi';

  if (isDismissed) return null;

  // If already installed and running standalone
  if (isInstalled) {
    if (compact) return null;
    return (
      <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-500/40 backdrop-blur-md flex items-center justify-between gap-3 text-xs text-emerald-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
            🤖
          </div>
          <div>
            <p className="font-bold text-white text-xs">
              {isHindi ? 'Android Native App सक्रिय है' : 'Android Native App Active'}
            </p>
            <p className="text-[11px] text-emerald-300/80">
              {isHindi ? 'पूर्ण ऑफ़लाइन व होम स्क्रीन मोड चालू है' : 'Standalone home-screen & offline mode active'}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-800/80 px-2 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          {isHindi ? 'इंस्टॉल्ड' : 'Installed'}
        </span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  // Compact Header / Pill Version
  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/20 active:scale-95 border border-emerald-400/40 cursor-pointer"
          title={isHindi ? 'Android ऐप इंस्टॉल करें' : 'Install Android App'}
        >
          <span className="text-xs">🤖</span>
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {isHindi ? 'ऐप इंस्टॉल करें' : 'Install App'}
          </span>
        </button>

        {showGuide && (
          <InstallGuideModal
            isHindi={isHindi}
            isAndroid={isAndroid}
            isIOS={isIOS}
            onClose={() => setShowGuide(false)}
          />
        )}
      </>
    );
  }

  // Full-width Prominent Banner (for Home Screen or Settings)
  return (
    <>
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start sm:items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-md border border-white/30 shrink-0">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                {isHindi ? 'किसान मौसम Android Native App' : 'Kisan Mausam Android Native App'}
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 border border-emerald-400/30">
                APK / PWA
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-0.5 font-normal leading-relaxed max-w-lg">
              {isHindi
                ? 'अपने Android फ़ोन पर इंस्टॉल करें: बिना इंटरनेट मौसम रडार, त्वरित होम स्क्रीन लॉन्च व सटीक अलर्ट।'
                : 'Install directly on your phone: Instant home-screen access, full offline radar & live weather alerts.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer border border-amber-200"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{isHindi ? 'फ़ोन में इंस्टॉल करें' : 'Install on Android'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-2 rounded-xl text-stone-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showGuide && (
        <InstallGuideModal
          isHindi={isHindi}
          isAndroid={isAndroid}
          isIOS={isIOS}
          onClose={() => setShowGuide(false)}
        />
      )}
    </>
  );
};

interface InstallGuideModalProps {
  isHindi: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  onClose: () => void;
}

const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isHindi,
  isAndroid,
  isIOS,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-stone-200 flex flex-col">
        {/* Header */}
        <div className="bg-emerald-950 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🤖</span>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {isHindi ? 'Android पर ऐप इंस्टॉल कैसे करें' : 'How to Install on Android'}
              </h3>
              <p className="text-[11px] text-emerald-200">
                {isHindi ? '3 आसान चरणों में होम स्क्रीन पर जोड़ें' : '3 simple steps for home-screen app'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="p-5 space-y-3.5 text-xs sm:text-sm text-stone-700">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <div>
              <p className="font-bold text-stone-900">
                {isHindi ? 'ब्राउज़र मेनू खोलें (तीन बिंदु ⋮)' : 'Tap Browser Menu (3 dots ⋮)'}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {isHindi
                  ? 'Chrome या अपने मोबाइल ब्राउज़र के ऊपरी दाएँ कोने में तीन बिंदुओं (⋮) पर टैप करें।'
                  : 'Tap the three vertical dots (⋮) in the top-right corner of Chrome or your browser.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </span>
            <div>
              <p className="font-bold text-stone-900">
                {isHindi ? '"Install app" या "Add to Home screen" चुनें' : 'Select "Install app" or "Add to Home screen"'}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {isHindi
                  ? 'मेनू में से "ऐप इंस्टॉल करें" या "होम स्क्रीन पर जोड़ें" विकल्प पर टैप करें।'
                  : 'Look for "Install application" or "Add to Home screen" in the options.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </span>
            <div>
              <p className="font-bold text-stone-900">
                {isHindi ? 'इंस्टॉल की पुष्टि करें' : 'Confirm Installation'}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {isHindi
                  ? 'पुष्टि करते ही किसान मौसम ऐप आपके फ़ोन के होम स्क्रीन और ऐप ड्रॉअर में एक नेटिव ऐप की तरह आ जाएगा।'
                  : 'Kisan Mausam will appear as a standalone app icon in your app drawer and home screen.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm mt-2 cursor-pointer transition-all active:scale-95"
          >
            {isHindi ? 'समझ गया' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};

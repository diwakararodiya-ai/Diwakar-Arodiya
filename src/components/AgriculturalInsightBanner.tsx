import React from 'react';
import { AgriculturalIndex, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../translations';
import { Droplet, ArrowRight, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

interface AgriculturalInsightBannerProps {
  agriIndex: AgriculturalIndex;
  language: SupportedLanguage;
  onAskAi: (prompt: string) => void;
}

export const AgriculturalInsightBanner: React.FC<AgriculturalInsightBannerProps> = ({
  agriIndex,
  language,
  onAskAi,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.Hindi;

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-800 flex items-center justify-center font-bold text-base shadow-2xs border border-emerald-400/30">
            🌱
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-tight tracking-tight">
              {t.agriculturalAdvice}
            </h3>
            <p className="text-[11px] text-stone-500 font-normal">
              {language === 'Hindi'
                ? 'मौसम के अनुसार खेत के लिए आवश्यक परिचालन निर्णय'
                : 'Direct operational decisions grounded in today’s forecast'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 2 Key Operational Decisions: Spraying & Irrigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Spray Window Card */}
        <div
          className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col justify-between gap-2.5 shadow-2xs ${
            agriIndex.sprayStatus === 'ideal'
              ? 'bg-emerald-500/10 backdrop-blur-md border-emerald-300/50'
              : agriIndex.sprayStatus === 'caution'
              ? 'bg-amber-500/10 backdrop-blur-md border-amber-300/50'
              : 'bg-rose-500/10 backdrop-blur-md border-rose-300/50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <span>🎯</span>
                <span>{t.sprayAdvisory}</span>
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs ${
                  agriIndex.sprayStatus === 'ideal'
                    ? 'bg-emerald-600 text-white'
                    : agriIndex.sprayStatus === 'caution'
                    ? 'bg-amber-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {agriIndex.sprayStatus === 'ideal'
                  ? (language === 'Hindi' ? 'उत्तम समय' : 'Ideal')
                  : agriIndex.sprayStatus === 'caution'
                  ? (language === 'Hindi' ? 'सावधानी' : 'Caution')
                  : (language === 'Hindi' ? 'छिड़काव न करें' : 'Do Not Spray')}
              </span>
            </div>

            {/* Suitability score meter */}
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-stone-200/80 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    agriIndex.sprayScore > 70
                      ? 'bg-emerald-500'
                      : agriIndex.sprayScore > 40
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${agriIndex.sprayScore}%` }}
                />
              </div>
              <span className="text-[11px] font-bold font-mono text-stone-700">
                {agriIndex.sprayScore}%
              </span>
            </div>

            <p className="mt-1.5 text-xs font-medium text-stone-800 leading-relaxed">
              {agriIndex.sprayReason}
            </p>
          </div>

          <button
            onClick={() =>
              onAskAi(
                language === 'Hindi'
                  ? 'क्या मैं आज अपनी फसल में कीटनाशक दवा का छिड़काव कर सकता हूँ?'
                  : 'Can I spray pesticides on my standing crops today?'
              )
            }
            className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group pt-1.5 border-t border-black/5 cursor-pointer"
          >
            <span>{language === 'Hindi' ? 'दवा छिड़काव पर AI सलाह लें' : 'Get spraying guidelines'}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Irrigation Card */}
        <div
          className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col justify-between gap-2.5 shadow-2xs ${
            agriIndex.irrigationStatus === 'withhold'
              ? 'bg-sky-500/10 backdrop-blur-md border-sky-300/50'
              : agriIndex.irrigationStatus === 'apply'
              ? 'bg-amber-500/10 backdrop-blur-md border-amber-300/50'
              : 'bg-stone-500/10 backdrop-blur-md border-stone-300/50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.irrigationAdvisory}</span>
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs ${
                  agriIndex.irrigationStatus === 'withhold'
                    ? 'bg-blue-700 text-white'
                    : agriIndex.irrigationStatus === 'apply'
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-700 text-white'
                }`}
              >
                {agriIndex.irrigationStatus === 'withhold'
                  ? (language === 'Hindi' ? 'सिंचाई रोकें' : 'Withhold')
                  : agriIndex.irrigationStatus === 'apply'
                  ? (language === 'Hindi' ? 'सिंचाई करें' : 'Irrigate')
                  : (language === 'Hindi' ? 'नमी जांचें' : 'Check Soil')}
              </span>
            </div>

            <p className="mt-2 text-xs font-medium text-stone-800 leading-relaxed">
              {agriIndex.irrigationReason}
            </p>
          </div>

          <button
            onClick={() =>
              onAskAi(
                language === 'Hindi'
                  ? 'क्या आज खेत में पानी/सिंचाई लगानी चाहिए?'
                  : 'Should I irrigate my field today?'
              )
            }
            className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group pt-1.5 border-t border-black/5 cursor-pointer"
          >
            <span>{language === 'Hindi' ? 'सिंचाई परामर्श विस्तार से पूछें' : 'Check irrigation plan'}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

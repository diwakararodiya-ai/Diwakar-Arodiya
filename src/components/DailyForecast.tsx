import React, { useState } from 'react';
import { DailyItem, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../translations';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  CloudSnow,
  Droplets,
  Thermometer,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Wind,
  ShieldAlert,
  Sunrise,
  Sprout,
  AlertTriangle,
} from 'lucide-react';

interface DailyForecastProps {
  daily: DailyItem[];
  language: SupportedLanguage;
}

interface VerticalThermometerProps {
  tempMin: number;
  tempMax: number;
  weekMin: number;
  weekMax: number;
  isToday?: boolean;
}

/**
 * Simplified, clear vertical thermometer:
 * - Max temp on top (warm tone)
 * - Calibrated vertical glass tube with colored mercury fill & base reservoir bulb
 * - Min temp at bottom (cool tone)
 */
const VerticalThermometer: React.FC<VerticalThermometerProps> = ({
  tempMin,
  tempMax,
  weekMin,
  weekMax,
  isToday,
}) => {
  const range = Math.max(1, weekMax - weekMin);
  // Bottom offset relative to week's absolute min
  const bottomOffsetPct = Math.max(0, Math.min(75, ((tempMin - weekMin) / range) * 100));
  // Height of mercury column
  const heightPct = Math.max(20, Math.min(100 - bottomOffsetPct, ((tempMax - tempMin) / range) * 100));

  return (
    <div className="flex flex-col items-center justify-center shrink-0 w-12 select-none">
      {/* Max Temperature at Top */}
      <div className="flex items-center gap-0.5 font-bold font-mono text-stone-900 text-xs sm:text-sm tracking-tight leading-none mb-1">
        <span>{tempMax}°</span>
        <ArrowUp className="w-2.5 h-2.5 text-rose-500 stroke-[3]" />
      </div>

      {/* Thermometer Tube and Bulb */}
      <div className="flex flex-col items-center relative my-0.5">
        {/* Glass Cylinder Tube */}
        <div className="relative w-2 sm:w-2.5 h-10 sm:h-12 rounded-full bg-stone-200/90 shadow-inner ring-1 ring-black/10 overflow-hidden flex flex-col justify-end">
          {/* Liquid Mercury Column */}
          <div
            className="absolute w-full rounded-full bg-gradient-to-t from-sky-400 via-amber-400 to-rose-500 shadow-xs transition-all duration-300"
            style={{
              bottom: `${bottomOffsetPct}%`,
              height: `${heightPct}%`,
            }}
          >
            {/* Gloss reflection highlight */}
            <div className="absolute inset-y-0 left-0.5 w-0.5 bg-white/50 rounded-full" />
          </div>

          {/* Today indicator pin */}
          {isToday && (
            <div
              className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white border border-stone-800 shadow-xs z-10"
              style={{
                bottom: `${Math.min(85, Math.max(15, bottomOffsetPct + heightPct * 0.5))}%`,
              }}
            />
          )}
        </div>

        {/* Bulb at base */}
        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 -mt-1 rounded-full bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 border-2 border-white shadow-xs flex items-center justify-center ring-1 ring-sky-700/30 z-10 shrink-0">
          <div className="w-1 h-1 rounded-full bg-white/80" />
        </div>
      </div>

      {/* Min Temperature at Bottom */}
      <div className="flex items-center gap-0.5 font-semibold font-mono text-sky-700 text-[11px] sm:text-xs tracking-tight leading-none mt-1">
        <span>{tempMin}°</span>
        <ArrowDown className="w-2.5 h-2.5 text-sky-500 stroke-[3]" />
      </div>
    </div>
  );
};

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily, language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.Hindi;
  const isHindi = language === 'Hindi';

  // State to expand a single day for field details (or none)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  // Compute global minimum and maximum temperatures across 7 days
  const weekMin = daily.length > 0 ? Math.min(...daily.map((d) => d.tempMin)) : 15;
  const weekMax = daily.length > 0 ? Math.max(...daily.map((d) => d.tempMax)) : 35;

  // Weather icon renderer
  const renderWeatherIcon = (code: number) => {
    const boxClass = 'w-9 h-9 rounded-xl flex items-center justify-center shrink-0';
    const iconClass = 'w-5 h-5 stroke-[2.2]';

    if ([95, 96, 99].includes(code)) {
      return (
        <div className={`${boxClass} bg-purple-100/80 border border-purple-200 text-purple-600`}>
          <CloudLightning className={iconClass} />
        </div>
      );
    }
    if ([61, 63, 65, 80, 81, 82].includes(code)) {
      return (
        <div className={`${boxClass} bg-sky-100/80 border border-sky-200 text-sky-600`}>
          <CloudRain className={iconClass} />
        </div>
      );
    }
    if ([51, 53, 55, 56, 57].includes(code)) {
      return (
        <div className={`${boxClass} bg-cyan-100/80 border border-cyan-200 text-cyan-600`}>
          <CloudDrizzle className={iconClass} />
        </div>
      );
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return (
        <div className={`${boxClass} bg-indigo-100/80 border border-indigo-200 text-indigo-500`}>
          <CloudSnow className={iconClass} />
        </div>
      );
    }
    if ([45, 48].includes(code)) {
      return (
        <div className={`${boxClass} bg-stone-100 border border-stone-200 text-stone-500`}>
          <CloudFog className={iconClass} />
        </div>
      );
    }
    if ([1, 2].includes(code)) {
      return (
        <div className={`${boxClass} bg-amber-100/80 border border-amber-200 text-amber-500`}>
          <CloudSun className={iconClass} />
        </div>
      );
    }
    if (code === 3) {
      return (
        <div className={`${boxClass} bg-stone-100 border border-stone-200 text-stone-500`}>
          <Cloud className={iconClass} />
        </div>
      );
    }
    return (
      <div className={`${boxClass} bg-amber-100/80 border border-amber-200 text-amber-500`}>
        <Sun className={iconClass} />
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3">
      {/* Simplified Clean Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-800">
            <Thermometer className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-tight">
              {t.weeklyForecast}
            </h3>
            <p className="text-[11px] text-stone-500 font-normal">
              {isHindi ? '7 दिनों का मौसम व ऊर्ध्वाधर थर्मामीटर' : '7-day forecast with vertical thermometers'}
            </p>
          </div>
        </div>

        {/* Week Temperature Range Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100/90 text-stone-700 font-medium border border-stone-200/80 text-xs">
          <span className="text-stone-400 text-[10px] uppercase font-bold">{isHindi ? 'विस्तार' : 'Range'}</span>
          <span className="font-mono font-bold text-sky-700">{weekMin}°</span>
          <span className="text-stone-400">→</span>
          <span className="font-mono font-bold text-rose-600">{weekMax}°C</span>
        </div>
      </div>

      {/* Pure, Simplified List View */}
      <div className="flex flex-col gap-2">
        {daily.map((item, idx) => {
          const isToday = idx === 0;
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={item.date || idx}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isToday
                  ? 'bg-gradient-to-r from-emerald-500/10 via-white to-amber-500/10 border-emerald-300 shadow-xs ring-1 ring-emerald-500/20'
                  : 'bg-white/80 hover:bg-white border-stone-200/70 hover:border-emerald-300 shadow-2xs'
              }`}
            >
              {/* Main List Row */}
              <div
                onClick={() => toggleExpand(idx)}
                className="w-full p-2.5 sm:p-3 flex items-center justify-between gap-3 cursor-pointer group select-none"
              >
                {/* 1. Day & Date info */}
                <div className="flex items-center gap-3 min-w-[130px] sm:min-w-[170px]">
                  {renderWeatherIcon(item.weatherCode)}
                  <div>
                    <div className="flex items-center gap-1.5">
                      {isToday ? (
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-emerald-700 text-white tracking-wider shadow-2xs">
                          {isHindi ? 'आज' : 'Today'}
                        </span>
                      ) : (
                        <span className="font-bold text-stone-900 text-xs sm:text-sm tracking-tight">
                          {item.dayDisplay}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 font-medium truncate max-w-[120px] sm:max-w-[160px] mt-0.5">
                      {item.condition}
                    </p>
                  </div>
                </div>

                {/* 2. Precipitation Probability Badge */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold font-mono border ${
                      item.rainProbability >= 25 || item.rainMm > 0
                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                        : 'bg-stone-50 text-stone-400 border-stone-200/60'
                    }`}
                  >
                    <Droplets
                      className={`w-3 h-3 ${
                        item.rainProbability >= 25 ? 'text-sky-600 fill-sky-200/40' : 'text-stone-300'
                      }`}
                    />
                    <span>{item.rainProbability}%</span>
                  </div>
                </div>

                {/* 3. Agriculture note on medium+ screens */}
                <div className="hidden md:flex items-center flex-1 min-w-0 px-2">
                  <div className="truncate text-xs font-medium text-stone-600 flex items-center gap-1.5">
                    {item.rainMm >= 10 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        <Droplets className="w-3 h-3 text-blue-600" />
                        <span className="truncate max-w-[200px]">{item.agriAlert || item.irrigationAdvice}</span>
                      </span>
                    ) : item.tempMax >= 38 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span className="truncate max-w-[200px]">{item.agriAlert || item.irrigationAdvice}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Sprout className="w-3 h-3 text-emerald-600" />
                        <span className="truncate max-w-[200px]">{item.agriAlert || item.irrigationAdvice}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Vertical Thermometer */}
                <div className="flex items-center justify-center shrink-0 px-1 sm:px-3">
                  <VerticalThermometer
                    tempMin={item.tempMin}
                    tempMax={item.tempMax}
                    weekMin={weekMin}
                    weekMax={weekMax}
                    isToday={isToday}
                  />
                </div>

                {/* 5. Minimal Expand Arrow */}
                <div className="text-stone-400 group-hover:text-stone-700 transition-colors shrink-0 pl-1">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Expandable Clean Details Drawer */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-stone-200/70 bg-stone-50/80 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5">
                    {/* Feels Like */}
                    <div className="bg-white p-2 rounded-lg border border-stone-200/80 shadow-2xs">
                      <div className="flex items-center gap-1 text-[10px] text-stone-500 font-medium">
                        <Thermometer className="w-3 h-3 text-amber-600" />
                        <span>{t.feelsLike}</span>
                      </div>
                      <p className="text-xs font-bold font-mono text-stone-900 mt-0.5">
                        {item.apparentMin}° – {item.apparentMax}°C
                      </p>
                    </div>

                    {/* Wind */}
                    <div className="bg-white p-2 rounded-lg border border-stone-200/80 shadow-2xs">
                      <div className="flex items-center gap-1 text-[10px] text-stone-500 font-medium">
                        <Wind className="w-3 h-3 text-teal-600" />
                        <span>{t.wind}</span>
                      </div>
                      <p className="text-xs font-bold font-mono text-stone-900 mt-0.5">
                        {item.windSpeedMax} <span className="text-[10px] text-stone-500 font-normal">km/h</span>
                      </p>
                    </div>

                    {/* UV Index */}
                    <div className="bg-white p-2 rounded-lg border border-stone-200/80 shadow-2xs">
                      <div className="flex items-center gap-1 text-[10px] text-stone-500 font-medium">
                        <ShieldAlert className="w-3 h-3 text-orange-600" />
                        <span>{t.uvIndex}</span>
                      </div>
                      <p className="text-xs font-bold font-mono text-stone-900 mt-0.5">
                        {item.uvIndexMax} / 12
                      </p>
                    </div>

                    {/* Sunrise / Sunset */}
                    <div className="bg-white p-2 rounded-lg border border-stone-200/80 shadow-2xs">
                      <div className="flex items-center gap-1 text-[10px] text-stone-500 font-medium">
                        <Sunrise className="w-3 h-3 text-amber-500" />
                        <span>{t.sunrise} / {t.sunset}</span>
                      </div>
                      <p className="text-xs font-bold font-mono text-stone-900 mt-0.5">
                        {item.sunrise} | {item.sunset}
                      </p>
                    </div>
                  </div>

                  {/* Agricultural Advice Banner */}
                  <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-start gap-2">
                    <Sprout className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-950 font-medium">
                      <span className="font-bold">{isHindi ? 'सलाह:' : 'Advice:'} </span>
                      {item.irrigationAdvice} {item.agriAlert ? `· ${item.agriAlert}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

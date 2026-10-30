import React from 'react';
import { HourlyItem, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../translations';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Wind, Droplets } from 'lucide-react';

interface HourlyForecastProps {
  hourly: HourlyItem[];
  language: SupportedLanguage;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly, language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.Hindi;

  const renderIcon = (code: number) => {
    if ([95, 96, 99].includes(code)) return <CloudLightning className="w-5 h-5 text-amber-500 drop-shadow-xs" />;
    if ([61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain className="w-5 h-5 text-sky-500 drop-shadow-xs" />;
    if ([51, 53, 55].includes(code)) return <CloudRain className="w-5 h-5 text-cyan-500 drop-shadow-xs" />;
    if ([1, 2].includes(code)) return <CloudSun className="w-5 h-5 text-amber-500 drop-shadow-xs" />;
    if (code === 3) return <Cloud className="w-5 h-5 text-stone-400 drop-shadow-xs" />;
    return <Sun className="w-5 h-5 text-amber-500 drop-shadow-xs" />;
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-tight tracking-tight">
            {t.hourlyForecast}
          </h3>
          <p className="text-[11px] text-stone-500 font-normal">
            {language === 'Hindi'
              ? 'घंटेवार बारिश की संभावना व छिड़काव अनुकूलता'
              : 'Hour-by-hour rain probability & spraying windows'}
          </p>
        </div>
        <span className="text-xs font-semibold text-emerald-900 bg-emerald-500/15 px-2.5 py-0.5 rounded-lg border border-emerald-400/30">
          48 {language === 'Hindi' ? 'घंटे' : 'Hours'}
        </span>
      </div>

      {/* Horizontally scrollable row */}
      <div className="flex gap-2 overflow-x-auto pb-2 pt-0.5 scrollbar-thin snap-x">
        {hourly.map((item, idx) => (
          <div
            key={item.time || idx}
            className={`shrink-0 w-24 p-2.5 rounded-xl border snap-start flex flex-col items-center justify-between gap-1 text-center transition-all duration-200 hover:scale-[1.02] shadow-2xs ${
              item.spraySuitability === 'good'
                ? 'bg-gradient-to-b from-white/90 to-emerald-50/80 border-emerald-300/60'
                : item.spraySuitability === 'unsuitable'
                ? 'bg-gradient-to-b from-white/90 to-rose-50/80 border-rose-300/60'
                : 'bg-white/80 hover:bg-white border-stone-200/70'
            }`}
          >
            {/* Time label */}
            <span className="text-[11px] font-bold text-stone-700">
              {item.hourDisplay}
            </span>

            {/* Weather Icon */}
            <div className="my-0.5">{renderIcon(item.weatherCode)}</div>

            {/* Temperature */}
            <span className="text-base font-bold text-stone-900 tabular-nums">
              {item.temp}°
            </span>

            {/* Rain chance pill */}
            <div
              className={`w-full py-0.5 px-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 ${
                item.rainProbability > 30
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              <Droplets className="w-2.5 h-2.5 shrink-0" />
              <span>{item.rainProbability}%</span>
            </div>

            {/* Wind speed */}
            <div className="flex items-center gap-1 text-[10px] text-stone-500 font-medium">
              <Wind className="w-2.5 h-2.5 text-stone-400" />
              <span>{item.windSpeed} km/h</span>
            </div>

            {/* Crop spraying tag */}
            <div
              className={`mt-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm w-full truncate ${
                item.spraySuitability === 'good'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200/80'
                  : item.spraySuitability === 'unsuitable'
                  ? 'bg-rose-100 text-rose-900 border border-rose-200/80'
                  : 'bg-amber-100 text-amber-900 border border-amber-200/80'
              }`}
              title={item.note || ''}
            >
              {item.spraySuitability === 'good'
                ? (language === 'Hindi' ? 'छिड़काव उत्तम' : 'Spray Safe')
                : item.spraySuitability === 'unsuitable'
                ? (language === 'Hindi' ? 'छिड़काव न करें' : 'No Spray')
                : (language === 'Hindi' ? 'सावधानी' : 'Caution')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

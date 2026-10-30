import React from 'react';
import { CurrentWeather, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../translations';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface WeatherCardProps {
  weather: CurrentWeather;
  language: SupportedLanguage;
  onAskAiQuick: (prompt: string) => void;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  language,
  onAskAiQuick,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.Hindi;

  // Icon selector based on weather code
  const renderWeatherIcon = () => {
    const code = weather.weatherCode;
    if ([95, 96, 99].includes(code)) {
      return <CloudLightning className="w-14 h-14 sm:w-16 sm:h-16 text-amber-400 drop-shadow-sm animate-pulse" />;
    }
    if ([61, 63, 65, 80, 81, 82].includes(code)) {
      return <CloudRain className="w-14 h-14 sm:w-16 sm:h-16 text-sky-400 drop-shadow-sm" />;
    }
    if ([51, 53, 55].includes(code)) {
      return <CloudRain className="w-14 h-14 sm:w-16 sm:h-16 text-cyan-300 drop-shadow-sm" />;
    }
    if ([1, 2].includes(code)) {
      return <CloudSun className="w-14 h-14 sm:w-16 sm:h-16 text-amber-300 drop-shadow-sm" />;
    }
    if (code === 3) {
      return <Cloud className="w-14 h-14 sm:w-16 sm:h-16 text-stone-300 drop-shadow-sm" />;
    }
    return <Sun className="w-14 h-14 sm:w-16 sm:h-16 text-amber-400 drop-shadow-sm animate-spin-slow" />;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* IMD Severe Alert Banner (if active) */}
      {weather.alert && (
        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-3 shadow-xs transition-all ${
            weather.alert.severity === 'red'
              ? 'bg-red-50/95 border-red-200 text-red-950'
              : weather.alert.severity === 'orange'
              ? 'bg-amber-50/95 border-amber-200 text-amber-950'
              : 'bg-yellow-50/95 border-yellow-200 text-yellow-950'
          }`}
        >
          <div
            className={`p-2 rounded-xl shrink-0 ${
              weather.alert.severity === 'red'
                ? 'bg-red-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold text-sm tracking-tight">
                {weather.alert.title}
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-white/90 border border-current shadow-2xs">
                {weather.alert.severity.toUpperCase()} ALERT
              </span>
            </div>
            <p className="text-xs mt-1 leading-relaxed text-stone-700">
              {weather.alert.description}
            </p>
            <div className="mt-2 text-xs font-semibold bg-white/95 p-2.5 rounded-xl border border-stone-200/60 flex items-center gap-1.5 shadow-2xs">
              <span className="text-emerald-800">💡 {language === 'Hindi' ? 'किसान सलाह:' : 'Action:'}</span>
              <span className="text-stone-900">{weather.alert.actionableAdvice}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Real-time Hero Weather Card with Obsidian Glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl glass-card-dark text-white p-5 sm:p-6 shadow-xl">
        <div className="relative z-10">
          {/* Top row: Status tag and updated time */}
          <div className="flex items-center justify-between gap-2 text-xs text-emerald-200/90 mb-3.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold tracking-wide uppercase text-[11px] text-emerald-300">
                {language === 'Hindi' ? 'ताज़ा मौसम रिपोर्ट' : 'Live Field Weather'}
              </span>
            </div>
            <span className="font-mono text-[11px] bg-black/30 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/10 text-stone-300">
              {t.updatedAt}: {weather.lastUpdated}
            </span>
          </div>

          {/* Temperature & Weather Illustration */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-bold tracking-tight tabular-nums text-white">
                  {weather.temp}°
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-emerald-200">
                    {t.feelsLike} {weather.feelsLike}°C
                  </span>
                  <span className="text-xs font-medium text-amber-300 mt-0.5">
                    H: {weather.tempMax}° • L: {weather.tempMin}°
                  </span>
                </div>
              </div>

              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-amber-200">
                  {weather.condition}
                </span>
              </div>
            </div>

            {/* Weather Icon with Frosted Pod */}
            <div className="self-start sm:self-auto p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-sm">
              {renderWeatherIcon()}
            </div>
          </div>

          {/* Highlighted Rain Chance Card with Frosted Glass */}
          <div className="mt-4 p-3.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-400/20 text-sky-200 flex items-center justify-center font-bold text-lg border border-sky-400/30 shrink-0">
                🌧️
              </div>
              <div>
                <div className="text-[11px] text-emerald-200 font-medium">
                  {t.rainProbability}
                </div>
                <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>{weather.rainProbability}%</span>
                  {weather.rainMm > 0 && (
                    <span className="text-xs font-semibold text-sky-300 font-mono">
                      ({weather.rainMm} mm)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                onAskAiQuick(
                  language === 'Hindi'
                    ? 'क्या आज बारिश होगी और मुझे खेत में क्या करना चाहिए?'
                    : 'Will it rain today and what should I do on my field?'
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-all active:scale-95 shrink-0 border border-amber-200 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              <span>{language === 'Hindi' ? 'AI सलाह' : 'Ask AI'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-900" />
            </button>
          </div>

          {/* Metrics Grid with Clean Frosted Tiles */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/10 transition-colors">
              <div className="text-emerald-200 flex items-center gap-1.5 font-medium text-[11px]">
                <Droplets className="w-3.5 h-3.5 text-cyan-300" />
                <span>{t.humidity}</span>
              </div>
              <div className="text-base font-bold text-white mt-0.5 tabular-nums">
                {weather.humidity}%
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/10 transition-colors">
              <div className="text-emerald-200 flex items-center gap-1.5 font-medium text-[11px]">
                <Wind className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t.wind}</span>
              </div>
              <div className="text-base font-bold text-white mt-0.5 tabular-nums">
                {weather.windSpeed} <span className="text-xs font-normal text-stone-300">km/h</span>
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/10 transition-colors">
              <div className="text-emerald-200 flex items-center gap-1.5 font-medium text-[11px]">
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span>{t.uvIndex}</span>
              </div>
              <div className="text-base font-bold text-white mt-0.5 tabular-nums">
                {weather.uvIndex} <span className="text-xs font-normal text-stone-300">/ 11</span>
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/10 transition-colors">
              <div className="text-emerald-200 flex items-center gap-1.5 font-medium text-[11px]">
                <Sunrise className="w-3.5 h-3.5 text-orange-300" />
                <span>{t.sunrise} • {t.sunset}</span>
              </div>
              <div className="text-xs font-semibold text-white mt-1 font-mono">
                {weather.sunrise} • {weather.sunset}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

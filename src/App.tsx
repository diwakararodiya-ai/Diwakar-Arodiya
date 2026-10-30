import React, { useState, useEffect } from 'react';
import {
  CurrentWeather,
  DailyItem,
  HourlyItem,
  LocationItem,
  CropProfile,
  SupportedLanguage,
  AgriculturalIndex,
  UserProfile,
} from './types';
import { TRANSLATIONS } from './translations';
import {
  INDIAN_AGRICULTURAL_PRESETS,
  parseWeatherData,
} from './services/weatherService';
import { Header } from './components/Header';
import { WeatherCard } from './components/WeatherCard';
import { AgriculturalInsightBanner } from './components/AgriculturalInsightBanner';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { WeatherMap } from './components/WeatherMap';
import { AIAssistant } from './components/AIAssistant';
import { CropManager } from './components/CropManager';
import { AgriNews } from './components/AgriNews';
import { LocationModal } from './components/LocationModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginModal } from './components/LoginModal';
import { AndroidInstallBanner } from './components/AndroidInstallBanner';
import {
  Sun,
  Newspaper,
  Sprout,
  Bot,
  Settings as SettingsIcon,
  RefreshCw,
  Mic,
  AlertCircle,
  HelpCircle,
  User,
} from 'lucide-react';

const DEFAULT_LOCATION: LocationItem = INDIAN_AGRICULTURAL_PRESETS[0]; // Nashik, Maharashtra

const INITIAL_CROPS: CropProfile[] = [
  {
    id: 'crop_wheat_1',
    name: 'गेहूँ (Wheat)',
    variety: 'HD-2967 (High Yield)',
    growthStage: 'flowering',
    irrigationType: 'borewell_drip',
    soilType: 'alluvial',
    fieldName: 'खेत 1 (Main Field)',
    sowingDate: '2026-11-15',
  },
  {
    id: 'crop_mustard_2',
    name: 'सरसों (Mustard)',
    variety: 'Pusa Bold',
    growthStage: 'grain_filling',
    irrigationType: 'sprinkler',
    soilType: 'alluvial',
    fieldName: 'खेत 2 (North Plot)',
    sowingDate: '2026-10-25',
  },
];

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'home' | 'news' | 'crops' | 'ai' | 'settings'>('home');

  // Language state (persisted)
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('kisan_lang');
    return (saved as SupportedLanguage) || 'Hindi';
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('kisan_onboarded');
  });

  // Location state
  const [currentLocation, setCurrentLocation] = useState<LocationItem>(() => {
    const saved = localStorage.getItem('kisan_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_LOCATION;
  });

  const [savedLocations, setSavedLocations] = useState<LocationItem[]>(() => {
    const saved = localStorage.getItem('kisan_saved_locations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      DEFAULT_LOCATION,
      INDIAN_AGRICULTURAL_PRESETS[1], // Ludhiana, Punjab
      INDIAN_AGRICULTURAL_PRESETS[2], // Karnal, Haryana
    ];
  });

  // Weather state
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [hourly, setHourly] = useState<HourlyItem[]>([]);
  const [daily, setDaily] = useState<DailyItem[]>([]);
  const [agriIndex, setAgriIndex] = useState<AgriculturalIndex | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Crop management state
  const [crops, setCrops] = useState<CropProfile[]>(() => {
    const saved = localStorage.getItem('kisan_crops');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_CROPS;
  });
  const [activeCropId, setActiveCropId] = useState<string>(INITIAL_CROPS[0].id);

  // Minimal User Profile state (persisted)
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('kisan_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  // Modal dialog states
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  // Trigger login flow at the start of the app if user is not logged in
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => {
    const savedUser = localStorage.getItem('kisan_user');
    const dismissed = sessionStorage.getItem('kisan_login_dismissed');
    return !savedUser && !dismissed;
  });
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // Quick prompt to pass to AI Assistant
  const [aiQuickPrompt, setAiQuickPrompt] = useState<string | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.Hindi;

  // Login & Profile handlers
  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('kisan_user', JSON.stringify(profile));
    sessionStorage.removeItem('kisan_login_dismissed');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kisan_user');
  };

  // Persist language
  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    localStorage.setItem('kisan_lang', lang);
    localStorage.setItem('kisan_onboarded', 'true');
    setIsOnboardingOpen(false);
    if (!user && !sessionStorage.getItem('kisan_login_dismissed')) {
      setIsLoginModalOpen(true);
    }
  };

  // Persist location
  const handleSelectLocation = (loc: LocationItem) => {
    setCurrentLocation(loc);
    localStorage.setItem('kisan_location', JSON.stringify(loc));
  };

  const handleSaveLocation = (loc: LocationItem) => {
    if (!savedLocations.some((s) => s.id === loc.id)) {
      const updated = [...savedLocations, loc];
      setSavedLocations(updated);
      localStorage.setItem('kisan_saved_locations', JSON.stringify(updated));
    }
  };

  // Crop persistence
  const handleAddCrop = (crop: CropProfile) => {
    const updated = [...crops, crop];
    setCrops(updated);
    setActiveCropId(crop.id);
    localStorage.setItem('kisan_crops', JSON.stringify(updated));
  };

  const handleDeleteCrop = (id: string) => {
    const updated = crops.filter((c) => c.id !== id);
    setCrops(updated);
    if (activeCropId === id && updated.length > 0) {
      setActiveCropId(updated[0].id);
    }
    localStorage.setItem('kisan_crops', JSON.stringify(updated));
  };

  const handleUpdateCropStage = (id: string, stage: CropProfile['growthStage']) => {
    const updated = crops.map((c) => (c.id === id ? { ...c, growthStage: stage } : c));
    setCrops(updated);
    localStorage.setItem('kisan_crops', JSON.stringify(updated));
  };

  const handleUpdateCrop = (updates: Partial<CropProfile>) => {
    const updated = crops.map((c) => (c.id === activeCropId ? { ...c, ...updates } : c));
    setCrops(updated);
    localStorage.setItem('kisan_crops', JSON.stringify(updated));
  };

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch real-time weather data
  const fetchWeather = async () => {
    setIsWeatherLoading(true);
    setWeatherError(null);

    try {
      const url = `/api/weather?lat=${currentLocation.lat}&lon=${currentLocation.lon}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather server returned ${response.status}`);
      }

      const json = await response.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Failed to retrieve weather records');
      }

      // Parse Open-Meteo payload
      const { current, hourly: hList, daily: dList, agriIndex: aIdx } = parseWeatherData(
        json.data,
        language
      );

      setWeather(current);
      setHourly(hList);
      setDaily(dList);
      setAgriIndex(aIdx);

      // Save to offline cache
      localStorage.setItem(
        `kisan_cached_weather_${currentLocation.lat}_${currentLocation.lon}`,
        JSON.stringify({ current, hourly: hList, daily: dList, agriIndex: aIdx, time: Date.now() })
      );
    } catch (err: any) {
      console.warn('Weather fetch error, checking cache:', err);
      // Fallback to cache if available
      const cached = localStorage.getItem(
        `kisan_cached_weather_${currentLocation.lat}_${currentLocation.lon}`
      );
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setWeather(parsed.current);
          setHourly(parsed.hourly);
          setDaily(parsed.daily);
          setAgriIndex(parsed.agriIndex);
          setIsOffline(true);
        } catch (e) {}
      } else {
        setWeatherError(
          language === 'Hindi'
            ? 'मौसम की जानकारी प्राप्त नहीं हो सकी। कृपया इंटरनेट कनेक्शन जांचें।'
            : 'Could not fetch live weather. Please check your internet connection.'
        );
      }
    } finally {
      setIsWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [currentLocation, language]);

  // GPS auto-detect handler
  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      alert(language === 'Hindi' ? 'आपके डिवाइस में GPS उपलब्ध नहीं है।' : 'GPS is not supported on this device.');
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocode via server
          const res = await fetch(`/api/geocode?q=${latitude},${longitude}`);
          let name = `Village (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`;
          if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              name = data.results[0].name;
            }
          }

          const gpsLoc: LocationItem = {
            id: `gps_${latitude}_${longitude}`,
            name,
            lat: latitude,
            lon: longitude,
            isGps: true,
            label: 'GPS Location',
          };
          handleSelectLocation(gpsLoc);
          handleSaveLocation(gpsLoc);
        } catch (e) {
          console.error('GPS Geocoding error:', e);
        } finally {
          setIsGpsLoading(false);
        }
      },
      (err) => {
        setIsGpsLoading(false);
        alert(
          language === 'Hindi'
            ? 'GPS अनुमति अस्वीकार या अनुपलब्ध है। कृपया गाँव का नाम सूची से चुनें।'
            : 'GPS location permission denied. Please pick a village from the list.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Trigger quick prompt in Ask AI tab
  const handleAskAiQuick = (prompt: string) => {
    setAiQuickPrompt(prompt);
    setActiveTab('ai');
  };

  const handleClearCache = () => {
    localStorage.clear();
    setSavedLocations([DEFAULT_LOCATION]);
    setCrops(INITIAL_CROPS);
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-emerald-50/50 via-slate-50 to-stone-100 flex flex-col font-sans pb-24 sm:pb-12 selection:bg-emerald-200 overflow-x-hidden">
      {/* Ambient glowing atmosphere orbs for realistic glassmorphism depth & blur */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-20 w-[420px] h-[420px] bg-emerald-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 -right-20 w-[380px] h-[380px] bg-amber-300/15 rounded-full blur-3xl" />
        <div className="absolute top-2/3 -left-16 w-[360px] h-[360px] bg-teal-300/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-[450px] h-[450px] bg-sky-300/15 rounded-full blur-3xl" />
      </div>

      {/* Sticky App Header */}
      <Header
        currentLocation={currentLocation}
        language={language}
        isOffline={isOffline}
        user={user}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onGpsDetect={handleGpsDetect}
        isGpsLoading={isGpsLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 sm:py-6 relative z-10">
        {/* Weather Loading Spinner */}
        {isWeatherLoading && !weather && (
          <div className="glass-panel rounded-2xl flex flex-col items-center justify-center py-16 text-stone-600 gap-2.5">
            <RefreshCw className="w-7 h-7 text-emerald-700 animate-spin" />
            <p className="font-semibold text-xs sm:text-sm">
              {language === 'Hindi'
                ? 'मौसम व उपग्रह आंकड़ों को लोड किया जा रहा है...'
                : 'Retrieving live satellite and weather forecast...'}
            </p>
          </div>
        )}

        {/* Error Banner */}
        {weatherError && !weather && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <p className="text-xs sm:text-sm font-semibold">{weatherError}</p>
            </div>
            <button
              onClick={fetchWeather}
              className="px-3.5 py-1.5 bg-rose-700 text-white rounded-xl text-xs font-semibold shrink-0"
            >
              {language === 'Hindi' ? 'पुनः प्रयास करें' : 'Retry'}
            </button>
          </div>
        )}

        {/* Tab 1: Home (मौसम) */}
        {activeTab === 'home' && weather && agriIndex && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Real-time Hero Weather Card */}
            <WeatherCard
              weather={weather}
              language={language}
              onAskAiQuick={handleAskAiQuick}
            />

            {/* Android Native App Installation & Offline Access Banner */}
            <AndroidInstallBanner language={language} />

            {/* Direct Operational Agricultural Takeaway */}
            <AgriculturalInsightBanner
              agriIndex={agriIndex}
              language={language}
              onAskAi={handleAskAiQuick}
            />

            {/* Compact Hourly Forecast */}
            <HourlyForecast hourly={hourly} language={language} />

            {/* 7-Day Forecast */}
            <DailyForecast daily={daily} language={language} />

            {/* Live Interactive Weather & Doppler Radar Map embedded directly in Weather Screen */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base leading-tight">
                    {t.weatherMap}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {language === 'Hindi'
                      ? 'लाइव वर्षा डॉपलर रडार और खेत निरीक्षण'
                      : 'Live Doppler precipitation radar & field inspection'}
                  </p>
                </div>
              </div>

              <WeatherMap
                currentLocation={currentLocation}
                savedLocations={savedLocations}
                weather={weather}
                language={language}
                onSelectMapLocation={(loc) => {
                  handleSelectLocation(loc);
                  handleSaveLocation(loc);
                }}
              />
            </div>

            {/* Floating Voice Assistant Banner with Glass Sheen */}
            <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/90 via-amber-400/90 to-yellow-400/90 backdrop-blur-xl text-emerald-950 border border-white/60 shadow-lg shadow-amber-500/10 flex items-center justify-between gap-3">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md text-emerald-900 flex items-center justify-center font-bold text-lg shadow-xs border border-white shrink-0">
                  🎙️
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm leading-tight tracking-tight">
                    {language === 'Hindi' ? 'बोलकर पूछें किसान मौसम मित्र से' : 'Ask with Voice Assistant'}
                  </h4>
                  <p className="text-[11px] text-emerald-950/85 font-normal mt-0.5">
                    {language === 'Hindi'
                      ? 'अपनी भाषा में बोलें और तुरंत फसल व मौसम परामर्श पाएं'
                      : 'Speak naturally in your mother tongue for instant advice'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('ai')}
                className="relative z-10 px-3.5 py-2 rounded-xl bg-emerald-900/95 hover:bg-emerald-950 text-white font-bold text-xs shadow-md shadow-emerald-950/15 shrink-0 transition-transform active:scale-95 border border-emerald-700/60 cursor-pointer"
              >
                {language === 'Hindi' ? 'अभी बात करें' : 'Talk Now'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Agri News (कृषि समाचार) with Google Search Grounding */}
        {activeTab === 'news' && (
          <div className="animate-in fade-in duration-200">
            <AgriNews
              language={language}
              currentLocation={currentLocation}
              onAskAiWithTopic={handleAskAiQuick}
            />
          </div>
        )}

        {/* Tab 3: My Crops & Fields (मेरी फसलें व खेत) */}
        {activeTab === 'crops' && (
          <div className="animate-in fade-in duration-200">
            <CropManager
              crops={crops}
              activeCropId={activeCropId}
              weather={weather}
              language={language}
              onSelectActiveCrop={setActiveCropId}
              onAddCrop={handleAddCrop}
              onDeleteCrop={handleDeleteCrop}
              onUpdateCropStage={handleUpdateCropStage}
              onAskAiForCrop={(cropName, stage) => {
                handleAskAiQuick(
                  language === 'Hindi'
                    ? `मेरी फसल ${cropName} में अभी ${stage} की अवस्था है। इस मौसम में मुझे क्या सावधानी रखनी चाहिए?`
                    : `My crop is ${cropName} currently in ${stage} stage. What precautions should I take in current weather?`
                );
              }}
            />
          </div>
        )}

        {/* Tab 4: AI Voice & Chat Assistant (किसान AI मित्र) */}
        {activeTab === 'ai' && (
          <div className="animate-in fade-in duration-200">
            <AIAssistant
              currentLocation={currentLocation}
              currentWeather={weather}
              hourly={hourly}
              daily={daily}
              activeCrop={crops.find((c) => c.id === activeCropId) || null}
              onUpdateCrop={handleUpdateCrop}
              language={language}
              user={user}
              quickPrompt={aiQuickPrompt}
              onClearQuickPrompt={() => setAiQuickPrompt(null)}
            />
          </div>
        )}

        {/* Tab 5: Settings (सेटिंग्स) with Glassmorphic Panels */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in duration-200">
            <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-3.5">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">{t.settings}</h2>

              {/* Farmer Account & Profile */}
              <div className="p-3.5 rounded-xl glass-panel-subtle flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 font-extrabold flex items-center justify-center shrink-0 shadow-sm border border-amber-200">
                    {user?.isLoggedIn ? (
                      user.name.trim().charAt(0).toUpperCase()
                    ) : (
                      <User className="w-5 h-5 text-stone-950" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                      {user?.isLoggedIn ? user.name : (language === 'Hindi' ? 'किसान खाता (लॉगिन)' : 'Farmer Account')}
                    </div>
                    <div className="text-xs text-stone-500 font-medium truncate">
                      {user?.isLoggedIn
                        ? `${user.phone} • ${user.email}`
                        : (language === 'Hindi' ? 'नाम, ईमेल और नंबर से लॉगिन करें' : 'Sign in with name, email & phone')}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-2xs transition-transform active:scale-95 cursor-pointer shrink-0"
                >
                  {user?.isLoggedIn
                    ? (language === 'Hindi' ? 'प्रोफ़ाइल' : 'Profile')
                    : (language === 'Hindi' ? 'लॉगिन' : 'Sign In')}
                </button>
              </div>

              {/* Android Native App Installation */}
              <AndroidInstallBanner language={language} />

              {/* Language Switch */}
              <div className="p-3.5 rounded-xl glass-panel-subtle flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs sm:text-sm text-stone-900">{t.changeLanguage}</div>
                  <div className="text-xs text-stone-500 font-medium">{language}</div>
                </div>
                <button
                  onClick={() => setIsLanguageModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-2xs transition-transform active:scale-95 cursor-pointer"
                >
                  {t.changeLanguage}
                </button>
              </div>

              {/* Cache clear */}
              <div className="p-3.5 rounded-xl glass-panel-subtle flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs sm:text-sm text-stone-900">{t.offlineCache}</div>
                  <div className="text-xs text-stone-500 font-normal">
                    {language === 'Hindi' ? 'स्थानीय रूप से सुरक्षित डेटा' : 'Locally stored forecast'}
                  </div>
                </div>
                <button
                  onClick={handleClearCache}
                  className="px-3 py-1.5 bg-stone-200/90 hover:bg-stone-300 text-stone-800 font-semibold text-xs rounded-lg shadow-2xs transition-transform active:scale-95 cursor-pointer"
                >
                  {language === 'Hindi' ? 'साफ़ करें' : 'Clear'}
                </button>
              </div>

              {/* Disclaimer */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 backdrop-blur-md border border-emerald-300/40 text-xs text-stone-700 leading-relaxed">
                <p className="font-bold text-emerald-950 mb-1">
                  🌾 {language === 'Hindi' ? 'कृषि विज्ञान व मौसम डिस्क्लेमर:' : 'Agricultural Advisory Disclaimer:'}
                </p>
                <p>{t.aiAdvisoryDisclaimer}</p>
                <p className="mt-1.5 text-stone-500">{t.officialWarningNotice}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modern Glassmorphic Floating Dock Navigation - Strictly Centered & Undistorted on All Devices */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] sm:w-auto sm:min-w-[500px] sm:max-w-xl glass-dock rounded-2xl py-2 px-3 sm:px-6 shadow-2xl shadow-stone-900/15 border border-stone-200/90 backdrop-blur-2xl">
        <div className="flex items-center justify-between sm:justify-center gap-1 sm:gap-2">
          {/* Tab 1: Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 sm:flex-initial sm:min-w-[72px] flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-emerald-500/15 text-emerald-950 font-bold border border-emerald-400/30'
                : 'text-stone-500 hover:text-stone-900 font-medium'
            }`}
          >
            <Sun className={`w-4 h-4 ${activeTab === 'home' ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
            <span className="text-[10px] leading-none whitespace-nowrap">{t.home}</span>
          </button>

          {/* Tab 2: Agri News */}
          <button
            onClick={() => setActiveTab('news')}
            className={`flex-1 sm:flex-initial sm:min-w-[72px] flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'news'
                ? 'bg-emerald-500/15 text-emerald-950 font-bold border border-emerald-400/30'
                : 'text-stone-500 hover:text-stone-900 font-medium'
            }`}
          >
            <Newspaper className={`w-4 h-4 ${activeTab === 'news' ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
            <span className="text-[10px] leading-none whitespace-nowrap">{t.agriNews}</span>
          </button>

          {/* Center Prominent AI Assistant Button */}
          <button
            onClick={() => setActiveTab('ai')}
            className="flex-1 sm:flex-initial sm:min-w-[80px] flex flex-col items-center justify-center -mt-6 group px-1 cursor-pointer shrink-0"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-105 active:scale-95 border-2 ${
                activeTab === 'ai'
                  ? 'bg-amber-400 text-stone-950 border-amber-200 shadow-amber-500/25 ring-2 ring-amber-300/30'
                  : 'bg-emerald-800 text-white border-emerald-600/50 shadow-emerald-950/20'
              }`}
            >
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-stone-900 mt-0.5 whitespace-nowrap">
              {t.askAi}
            </span>
          </button>

          {/* Tab 4: My Crops */}
          <button
            onClick={() => setActiveTab('crops')}
            className={`flex-1 sm:flex-initial sm:min-w-[72px] flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'crops'
                ? 'bg-emerald-500/15 text-emerald-950 font-bold border border-emerald-400/30'
                : 'text-stone-500 hover:text-stone-900 font-medium'
            }`}
          >
            <Sprout className={`w-4 h-4 ${activeTab === 'crops' ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
            <span className="text-[10px] leading-none whitespace-nowrap">{t.myCrops}</span>
          </button>

          {/* Tab 5: Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 sm:flex-initial sm:min-w-[72px] flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-emerald-500/15 text-emerald-950 font-bold border border-emerald-400/30'
                : 'text-stone-500 hover:text-stone-900 font-medium'
            }`}
          >
            <SettingsIcon className={`w-4 h-4 ${activeTab === 'settings' ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
            <span className="text-[10px] leading-none whitespace-nowrap">{t.settings}</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        savedLocations={savedLocations}
        language={language}
        onSelectLocation={handleSelectLocation}
        onSaveLocation={handleSaveLocation}
        onGpsDetect={handleGpsDetect}
        isGpsLoading={isGpsLoading}
      />

      <LanguageSelectorModal
        isOpen={isLanguageModalOpen || isOnboardingOpen}
        onClose={() => {
          setIsLanguageModalOpen(false);
          setIsOnboardingOpen(false);
        }}
        currentLanguage={language}
        onSelectLanguage={handleSelectLanguage}
        isOnboarding={isOnboardingOpen}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        language={language}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onClearCache={handleClearCache}
      />

      {/* Minimal Login & Profile Flow Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          sessionStorage.setItem('kisan_login_dismissed', 'true');
        }}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        language={language}
      />
    </div>
  );
}

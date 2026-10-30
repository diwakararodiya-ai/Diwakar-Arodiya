import React, { useState, useEffect } from 'react';
import { AgriNewsItem, SupportedLanguage, LocationItem } from '../types';
import { TRANSLATIONS } from '../translations';
import {
  Newspaper,
  ExternalLink,
  Volume2,
  VolumeX,
  RefreshCw,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Landmark,
  CloudSun,
  Sprout,
  Cpu,
} from 'lucide-react';

interface AgriNewsProps {
  language: SupportedLanguage;
  currentLocation: LocationItem;
  onAskAiWithTopic: (topic: string) => void;
}

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'Government Scheme': 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
  'Mandi & MSP': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  'Weather & Agromet': 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=800&q=80',
  'Crop Advisory': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
  'Technology & Subsidies': 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_AGRI_IMAGE = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80';

export const AgriNews: React.FC<AgriNewsProps> = ({
  language,
  currentLocation,
  onAskAiWithTopic,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.Hindi;
  const [newsList, setNewsList] = useState<AgriNewsItem[]>(() => {
    try {
      const saved = localStorage.getItem(`kisan_news_${language}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !localStorage.getItem(`kisan_news_${language}`);
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [groundingSources, setGroundingSources] = useState<{ title: string; url: string }[]>([]);
  const [playingNewsId, setPlayingNewsId] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });
  const [refreshSuccessMessage, setRefreshSuccessMessage] = useState<string | null>(null);

  // Fetch news grounded in Google Search with auto-refresh support
  const fetchAgriNews = async (force = false) => {
    if (newsList.length === 0) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const state = currentLocation.state || 'India';
      const forceQuery = force ? '&force=true' : '';
      const res = await fetch(
        `/api/agri-news?language=${encodeURIComponent(language)}&state=${encodeURIComponent(state)}${forceQuery}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.news && data.news.length > 0) {
          setNewsList(data.news);
          try {
            localStorage.setItem(`kisan_news_${language}`, JSON.stringify(data.news));
            localStorage.setItem(`kisan_news_date_${language}`, new Date().toISOString());
          } catch {}
        }
        if (data.webSources) {
          setGroundingSources(data.webSources);
        }
        setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        if (force) {
          setRefreshSuccessMessage(language === 'Hindi' ? 'ताज़ा समाचार लोड हो गए!' : 'Fresh news loaded!');
          setTimeout(() => setRefreshSuccessMessage(null), 3000);
        }
      }
    } catch (err) {
      console.error('Error fetching agri news:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch and auto-refresh interval (every 10 minutes)
  useEffect(() => {
    fetchAgriNews(false);

    // Auto-refresh timer every 10 minutes for daily updates
    const interval = setInterval(() => {
      fetchAgriNews(true);
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [language, currentLocation]);

  // Audio speech synthesis for a news item
  const handleListenNews = (item: AgriNewsItem) => {
    if (playingNewsId === item.id) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setPlayingNewsId(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `${item.title}. ${item.summary} किसान सलाह: ${item.farmerTakeaway}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.onend = () => setPlayingNewsId(null);
      utterance.onerror = () => setPlayingNewsId(null);
      setPlayingNewsId(item.id);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filter news items
  const filteredNews = newsList.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' ||
      item.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
      (item.categoryLocal && item.categoryLocal.toLowerCase().includes(activeCategory.toLowerCase()));

    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmerTakeaway.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const categories = [
    { key: 'all', icon: Newspaper, label: language === 'Hindi' ? 'सभी समाचार' : 'All Updates' },
    { key: 'Government Scheme', icon: Landmark, label: language === 'Hindi' ? 'सरकारी योजनाएं' : 'Govt Schemes' },
    { key: 'Mandi & MSP', icon: TrendingUp, label: language === 'Hindi' ? 'मंडी भाव व MSP' : 'Mandi & MSP' },
    { key: 'Weather & Agromet', icon: CloudSun, label: language === 'Hindi' ? 'मौसम व फसल सुरक्षा' : 'Weather & Crop' },
    { key: 'Crop Advisory', icon: Sprout, label: language === 'Hindi' ? 'फसल परामर्श' : 'Crop Advisory' },
    { key: 'Technology & Subsidies', icon: Cpu, label: language === 'Hindi' ? 'सब्सिडी व तकनीक' : 'Agri-Tech' },
  ];

  const getCategoryTheme = (category: string) => {
    if (category === 'Government Scheme') {
      return {
        bg: 'bg-blue-600/90 text-white border-blue-400/40',
        dot: 'bg-blue-400',
        badge: '🏛️',
      };
    }
    if (category === 'Mandi & MSP') {
      return {
        bg: 'bg-emerald-600/90 text-white border-emerald-400/40',
        dot: 'bg-emerald-400',
        badge: '🌾',
      };
    }
    if (category === 'Weather & Agromet') {
      return {
        bg: 'bg-amber-600/90 text-white border-amber-400/40',
        dot: 'bg-amber-400',
        badge: '⛅',
      };
    }
    if (category === 'Crop Advisory') {
      return {
        bg: 'bg-teal-600/90 text-white border-teal-400/40',
        dot: 'bg-teal-400',
        badge: '🌿',
      };
    }
    return {
      bg: 'bg-purple-600/90 text-white border-purple-400/40',
      dot: 'bg-purple-400',
      badge: '🚜',
    };
  };

  const getCoverImage = (item: AgriNewsItem) => {
    return item.imageUrl || CATEGORY_FALLBACK_IMAGES[item.category] || DEFAULT_AGRI_IMAGE;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Modern Clean Header Banner */}
      <div className="glass-card-dark text-white p-5 sm:p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl">📰</span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
              {t.agriNews}
            </h2>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{language === 'Hindi' ? 'दैनिक ताज़ा अपडेट 🟢' : 'Daily Fresh Updates 🟢'}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-xl font-normal leading-relaxed">
            {t.agriNewsSubtitle}
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-emerald-300/80">
            <span>{language === 'Hindi' ? `अंतिम अपडेट: ${lastUpdatedTime}` : `Last refreshed: ${lastUpdatedTime}`}</span>
            <span>•</span>
            <span>{language === 'Hindi' ? 'हर 10 मिनट में स्वतः रिफ्रेश' : 'Auto-refreshes every 10m'}</span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-end gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => fetchAgriNews(true)}
            disabled={isLoading || isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer border border-amber-200 disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? (language === 'Hindi' ? 'अपडेट हो रहा...' : 'Refreshing...') : t.refreshNews}</span>
          </button>
          {refreshSuccessMessage && (
            <span className="text-[10px] font-bold text-amber-300 animate-fade-in bg-stone-900/80 px-2 py-0.5 rounded-md border border-amber-400/30">
              ✓ {refreshSuccessMessage}
            </span>
          )}
        </div>
      </div>

      {/* Google Search Grounding Verification Box */}
      {groundingSources.length > 0 && (
        <div className="glass-panel rounded-xl p-3 shadow-xs flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between text-stone-600 font-semibold text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.googleSearchVerified}</span>
            </span>
            <span className="text-stone-400 font-normal">
              {currentLocation.state ? `${currentLocation.state} • ` : ''}Verified Portals
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {groundingSources.slice(0, 4).map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium text-stone-700 hover:text-emerald-800 glass-pill hover:bg-white px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 truncate max-w-[220px] transition-colors"
              >
                <ExternalLink className="w-3 h-3 text-stone-400 shrink-0" />
                <span className="truncate">{source.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs scale-[1.01] border border-emerald-700'
                    : 'glass-panel hover:bg-white text-stone-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-stone-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Search in News */}
        <div className="relative sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'Hindi' ? 'समाचार में खोजें...' : 'Search news...'}
            className="w-full pl-8 pr-3 py-1.5 text-xs glass-input rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs font-normal text-stone-800 placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* News Cards Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2.5 text-stone-500">
          <RefreshCw className="w-7 h-7 text-emerald-700 animate-spin" />
          <p className="text-xs sm:text-sm font-semibold text-stone-700">
            {language === 'Hindi'
              ? 'Google Search से ताज़ा कृषि समाचार खोजे जा रहे हैं...'
              : 'Fetching real-time agricultural news via Google Search...'}
          </p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-600 text-xs sm:text-sm p-6">
          <p className="text-sm font-bold text-stone-800 mb-1">
            {language === 'Hindi' ? 'कोई समाचार नहीं मिला' : 'No news found'}
          </p>
          <p className="text-stone-500">
            {language === 'Hindi'
              ? 'इस श्रेणी में कोई खबर नहीं मिली। कृपया अन्य श्रेणी चुनें या खोज बदलें।'
              : 'No articles matching your current filter. Please select "All Updates" or try another keyword.'}
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="mt-3 px-3.5 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            {language === 'Hindi' ? 'सभी समाचार देखें' : 'View All News'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNews.map((news) => {
            const isPlaying = playingNewsId === news.id;
            const theme = getCategoryTheme(news.category);
            const coverImage = getCoverImage(news);

            return (
              <div
                key={news.id}
                className="glass-panel rounded-2xl shadow-sm hover:border-emerald-400/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Cover Thumbnail Image with Overlay */}
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-100">
                    <img
                      src={coverImage}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          CATEGORY_FALLBACK_IMAGES[news.category] || DEFAULT_AGRI_IMAGE;
                      }}
                    />
                    {/* Dark gradient overlay for readable text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex items-end justify-between p-3.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border backdrop-blur-md shadow-xs flex items-center gap-1.5 ${theme.bg}`}
                      >
                        <span>{theme.badge}</span>
                        <span>{news.categoryLocal || news.category}</span>
                      </span>

                      <span className="text-[11px] text-white/95 font-mono font-medium bg-stone-900/60 px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                        <span>🕒</span>
                        <span>{news.publishedTime}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex flex-col gap-2.5">
                    {/* Headline in clear readable font */}
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug tracking-tight group-hover:text-emerald-950 transition-colors">
                      {news.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                      {news.summary}
                    </p>

                    {/* Actionable Farmer Takeaway Box */}
                    <div className="mt-1 p-3 rounded-xl bg-amber-500/10 border border-amber-300/40 text-xs text-stone-800 leading-snug">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5 mb-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>{language === 'Hindi' ? 'किसान के लिए मुख्य कदम:' : 'Action for Farmers:'}</span>
                      </div>
                      <div className="font-medium text-stone-900 leading-relaxed">{news.farmerTakeaway}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {/* Listen Audio Button */}
                    <button
                      onClick={() => handleListenNews(news)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                        isPlaying
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200/60'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <div className="flex items-center gap-0.5 h-3">
                            <span className="w-1 bg-white rounded-full animate-sound-wave-1" />
                            <span className="w-1 bg-white rounded-full animate-sound-wave-2" />
                            <span className="w-1 bg-white rounded-full animate-sound-wave-3" />
                          </div>
                          <span>{language === 'Hindi' ? 'रोकें' : 'Stop'}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{t.listenNews}</span>
                        </>
                      )}
                    </button>

                    {/* Ask AI about this news */}
                    <button
                      onClick={() =>
                        onAskAiWithTopic(
                          language === 'Hindi'
                            ? `कृपया मुझे "${news.title}" के बारे में बताएं और यह मेरी फसल व खेती पर कैसे लागू होता है?`
                            : `Can you explain the details of "${news.title}" and how it applies to my crops?`
                        )
                      }
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-100/90 hover:bg-amber-200 text-amber-950 border border-amber-300/60 transition-colors cursor-pointer"
                      title="Ask AI Mitra for more details"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>{language === 'Hindi' ? 'AI से पूछें' : 'Ask AI'}</span>
                    </button>
                  </div>

                  {/* Direct Verified Source Link */}
                  {news.sourceUrl && (
                    <a
                      href={news.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-stone-500 hover:text-emerald-800 flex items-center gap-1 transition-colors group/link"
                    >
                      <span className="truncate max-w-[130px] group-hover/link:underline">{news.sourceName || t.readSource}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

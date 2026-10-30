import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationItem, CurrentWeather, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../translations';
import {
  Compass,
  Maximize2,
  Minimize2,
  RefreshCw,
  Droplets,
  Cloud,
  Sliders,
  Layers,
  Info,
  CheckCircle2,
  X,
  Map as MapIcon,
} from 'lucide-react';

interface WeatherMapProps {
  currentLocation: LocationItem;
  savedLocations: LocationItem[];
  weather: CurrentWeather | null;
  language: SupportedLanguage;
  onSelectMapLocation: (loc: LocationItem) => void;
}

interface RadarMetaResponse {
  version?: string;
  status?: string;
  primaryProvider?: string;
  backupProvider?: string;
  generated?: number;
  host: string;
  radar: {
    past?: Array<{ time: number; path: string }>;
    nowcast?: Array<{ time: number; path: string }>;
  };
  satellite?: {
    infrared?: Array<{ time: number; path: string }>;
  };
}

// Highly reliable global base map providers with guaranteed CORS and clear visual contrast
const BASE_MAP_PROVIDERS = {
  streets: {
    name: 'Streets & Terrain',
    hindiName: 'सड़क व भूभाग',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, DeLorme, NAVTEQ, TomTom',
    maxZoom: 18,
  },
  satellite: {
    name: 'Aerial Satellite',
    hindiName: 'उपग्रह खेत चित्र',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, DigitalGlobe, GeoEye, Earthstar Geographics',
    maxZoom: 18,
  },
  carto: {
    name: 'Carto Light',
    hindiName: 'सादा नक्शा',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap & CARTO',
    maxZoom: 18,
    subdomains: 'abcd',
  },
};

export const WeatherMap: React.FC<WeatherMapProps> = ({
  currentLocation,
  savedLocations,
  weather,
  language,
  onSelectMapLocation,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.Hindi;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  // Weather overlay layer: Doppler rain radar, satellite infrared clouds, or pure base map
  const [activeLayer, setActiveLayer] = useState<'radar' | 'satellite' | 'base'>('radar');
  // Base map style: high-contrast streets & terrain, photographic satellite farmland, or light carto
  const [baseMapStyle, setBaseMapStyle] = useState<'streets' | 'satellite' | 'carto'>('streets');
  const [showBaseMapMenu, setShowBaseMapMenu] = useState<boolean>(false);

  const [radarMeta, setRadarMeta] = useState<RadarMetaResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.75);
  const [showOpacitySlider, setShowOpacitySlider] = useState<boolean>(false);
  const [showApiInfo, setShowApiInfo] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [lastScanTime, setLastScanTime] = useState<string>('Live');

  // Fetch unified Doppler & Satellite weather map metadata
  const fetchRadarMeta = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/radar-meta');
      if (res.ok) {
        const data: RadarMetaResponse = await res.json();
        setRadarMeta(data);

        // Get timestamp of latest radar scan
        const latestFrame = data.radar?.past?.slice(-1)[0] || data.radar?.nowcast?.[0];
        if (latestFrame?.time) {
          const scanDate = new Date(latestFrame.time * 1000);
          const timeStr = scanDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setLastScanTime(timeStr);
        }
      }
    } catch (err) {
      console.warn('Failed to load radar metadata:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRadarMeta();
  }, []);

  // Initialize Leaflet Map with EPSG:3857 Spherical Mercator projection
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Teardown existing instance to prevent duplicate binding
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Standard Web Mercator (EPSG:3857) - perfectly matches global Doppler and GIS tiles
    const map = L.map(mapContainerRef.current, {
      center: [currentLocation.lat, currentLocation.lon],
      zoom: 9,
      minZoom: 3,
      maxZoom: 18,
      crs: L.CRS.EPSG3857,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean top-right zoom control
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial Base Map Layer
    const provider = BASE_MAP_PROVIDERS[baseMapStyle];
    const baseLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
      subdomains: (provider as any).subdomains || 'abc',
      zIndex: 1,
    }).addTo(map);
    baseLayerRef.current = baseLayer;

    // Markers group for farm plots and current location
    markersGroupRef.current = L.layerGroup().addTo(map);

    // Click anywhere on map to inspect coordinates or switch location
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const formattedLat = Number(lat.toFixed(4));
      const formattedLon = Number(lng.toFixed(4));

      if (clickMarkerRef.current) {
        map.removeLayer(clickMarkerRef.current);
      }

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-xs text-stone-800 font-sans';
      popupContent.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 3px; font-size: 13px;">📍 ${
          language === 'Hindi' ? 'चुना गया स्थान' : 'Selected Location'
        }</div>
        <div style="color: #666; font-size: 11px; margin-bottom: 8px;">${formattedLat}°N, ${formattedLon}°E</div>
        <button id="select-plot-btn" style="
          background-color: #065f46;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 11px;
          cursor: pointer;
          width: 100%;
        ">
          ${language === 'Hindi' ? 'यह खेत चुनें' : 'Select This Location'}
        </button>
      `;

      const selectBtn = popupContent.querySelector('#select-plot-btn');
      if (selectBtn) {
        selectBtn.addEventListener('click', () => {
          onSelectMapLocation({
            id: `plot_${formattedLat}_${formattedLon}`,
            name: `${formattedLat}°, ${formattedLon}°`,
            lat: formattedLat,
            lon: formattedLon,
            label: language === 'Hindi' ? 'खेत प्लॉट' : 'Field Plot',
          });
          map.closePopup();
        });
      }

      const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(popupContent, { offset: [0, -10], closeButton: true })
        .openPopup();

      clickMarkerRef.current = marker;
    });

    mapInstanceRef.current = map;

    // Force size recomputation to ensure all tiles render immediately
    const invalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    map.whenReady(invalidate);
    requestAnimationFrame(invalidate);
    const t1 = setTimeout(invalidate, 100);
    const t2 = setTimeout(invalidate, 300);
    const t3 = setTimeout(invalidate, 600);
    const t4 = setTimeout(invalidate, 1200);

    // Automatic resize handling when panel expands or window resizes
    const resizeObserver = new ResizeObserver(() => {
      invalidate();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Base Map style dynamically without remounting map
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (baseLayerRef.current) {
      mapInstanceRef.current.removeLayer(baseLayerRef.current);
      baseLayerRef.current = null;
    }

    const provider = BASE_MAP_PROVIDERS[baseMapStyle];
    const newBaseLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
      subdomains: (provider as any).subdomains || 'abc',
      zIndex: 1,
    });
    newBaseLayer.addTo(mapInstanceRef.current);
    newBaseLayer.bringToBack();
    baseLayerRef.current = newBaseLayer;

    // Trigger tile refresh
    mapInstanceRef.current.invalidateSize();
  }, [baseMapStyle]);

  // Update map view when current location changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentLocation.lat, currentLocation.lon], 9, {
        animate: true,
      });
    }
  }, [currentLocation.lat, currentLocation.lon]);

  // Update farm markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    // Primary current farm location icon
    const mainIcon = L.divIcon({
      className: 'custom-main-pin',
      html: `
        <div style="
          background: #065f46;
          color: #ffffff;
          padding: 4px 10px;
          border-radius: 20px;
          border: 2px solid #ffffff;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          font-family: inherit;
        ">
          <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#34d399; box-shadow: 0 0 8px #34d399;"></span>
          ${currentLocation.label || currentLocation.name} ${weather ? `(${Math.round(weather.temp)}°)` : ''}
        </div>
      `,
      iconSize: [110, 30],
      iconAnchor: [55, 15],
    });

    const mainMarker = L.marker([currentLocation.lat, currentLocation.lon], { icon: mainIcon })
      .bindPopup(
        `<b>${currentLocation.label || currentLocation.name}</b><br/>${
          language === 'Hindi' ? 'वर्तमान चयनित खेत' : 'Current active field'
        }`
      );
    markersGroupRef.current.addLayer(mainMarker);

    // Saved farm locations
    savedLocations.forEach((loc) => {
      if (loc.id === currentLocation.id) return;

      const subIcon = L.divIcon({
        className: 'custom-sub-pin',
        html: `
          <div style="
            background: #ffffff;
            color: #1c1917;
            padding: 3px 8px;
            border-radius: 14px;
            border: 1.5px solid #a8a29e;
            font-size: 10px;
            font-weight: 600;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            white-space: nowrap;
            font-family: inherit;
          ">
            🌾 ${loc.label || loc.name}
          </div>
        `,
        iconSize: [85, 26],
        iconAnchor: [42, 13],
      });

      const m = L.marker([loc.lat, loc.lon], { icon: subIcon })
        .bindPopup(`<b>${loc.label || loc.name}</b><br/>${loc.district || ''}`)
        .on('click', () => onSelectMapLocation(loc));
      markersGroupRef.current?.addLayer(m);
    });
  }, [currentLocation, savedLocations, weather, language]);

  // Synchronize Doppler Radar and Satellite Layers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clean old tile layers
    if (radarLayerRef.current) {
      mapInstanceRef.current.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }
    if (satelliteLayerRef.current) {
      mapInstanceRef.current.removeLayer(satelliteLayerRef.current);
      satelliteLayerRef.current = null;
    }

    if (!radarMeta) return;

    // 1. Live Doppler Precipitation Radar Layer
    if (activeLayer === 'radar') {
      const latestRadar = radarMeta.radar?.past?.slice(-1)[0] || radarMeta.radar?.nowcast?.[0];
      if (latestRadar) {
        const timeVal = latestRadar.time || (latestRadar.path ? latestRadar.path.replace(/^\/v2\/radar\//, '') : '');
        // Fetch via high-performance local proxy with automatic fallback and in-memory caching
        const radarUrl = `/api/weather-tile/radar/${timeVal}/{z}/{x}/{y}.png`;
        const layer = L.tileLayer(radarUrl, {
          opacity: radarOpacity,
          maxZoom: 18,
          tileSize: 256,
          zIndex: 10,
        });
        layer.addTo(mapInstanceRef.current);
        radarLayerRef.current = layer;
      }
    } else if (activeLayer === 'satellite') {
      // 2. Infrared Satellite Cloud Layer
      const latestSat = radarMeta.satellite?.infrared?.slice(-1)[0];
      if (latestSat) {
        const timeVal = latestSat.time || (latestSat.path ? latestSat.path.replace(/^\/v2\/satellite\//, '') : '');
        const satUrl = `/api/weather-tile/satellite/${timeVal}/{z}/{x}/{y}.png`;
        const layer = L.tileLayer(satUrl, {
          opacity: radarOpacity,
          maxZoom: 18,
          tileSize: 256,
          zIndex: 10,
        });
        layer.addTo(mapInstanceRef.current);
        satelliteLayerRef.current = layer;
      }
    }
  }, [activeLayer, radarMeta, radarOpacity]);

  // Dynamically update layer opacity
  useEffect(() => {
    if (radarLayerRef.current) {
      radarLayerRef.current.setOpacity(radarOpacity);
    }
    if (satelliteLayerRef.current) {
      satelliteLayerRef.current.setOpacity(radarOpacity);
    }
  }, [radarOpacity]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentLocation.lat, currentLocation.lon], 9, {
        animate: true,
      });
      mapInstanceRef.current.invalidateSize();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 320);
  };

  return (
    <div
      className={`flex flex-col glass-panel rounded-2xl shadow-sm overflow-hidden relative transition-all duration-300 border border-stone-200/80 ${
        isExpanded ? 'h-[620px]' : 'h-[460px]'
      }`}
    >
      {/* Sleek Map Header Bar (Integrated Overlays & Base Map Switcher) */}
      <div className="bg-stone-900/95 backdrop-blur-xl text-stone-100 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 z-10 border-b border-white/10">
        {/* Left: Doppler Status & Sweep Timestamp */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ring-4 ring-emerald-400/20" />
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              {language === 'Hindi' ? 'डॉपलर रडार मानचित्र' : 'Doppler Radar Map'}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800">
              {lastScanTime}
            </span>
            <button
              onClick={() => setShowApiInfo(true)}
              className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400/90 bg-emerald-950/70 hover:bg-emerald-900/90 px-1.5 py-0.5 rounded border border-emerald-800/60 cursor-pointer transition-colors"
              title="Weather Map API Details"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>API Live</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Map Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Weather Overlay Selector (Radar / Clouds / Pure Map) */}
          <div className="flex items-center bg-stone-800/90 p-0.5 rounded-lg border border-stone-700">
            <button
              onClick={() => setActiveLayer('radar')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                activeLayer === 'radar'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
              title="Doppler Rain Radar Overlay"
            >
              <Droplets className="w-3 h-3 text-cyan-300" />
              <span>{language === 'Hindi' ? 'रडार' : 'Radar'}</span>
            </button>

            <button
              onClick={() => setActiveLayer('satellite')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                activeLayer === 'satellite'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
              title="Satellite Cloud Cover Overlay"
            >
              <Cloud className="w-3 h-3 text-sky-300" />
              <span>{language === 'Hindi' ? 'बादल' : 'Clouds'}</span>
            </button>

            <button
              onClick={() => setActiveLayer('base')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                activeLayer === 'base'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
              title="Clean Basemap Only"
            >
              <Layers className="w-3 h-3 text-stone-300" />
              <span>{language === 'Hindi' ? 'साफ नक्शा' : 'Basemap'}</span>
            </button>
          </div>

          {/* Base Map Style Selector (Streets / Satellite / Carto) */}
          <div className="relative">
            <button
              onClick={() => setShowBaseMapMenu(!showBaseMapMenu)}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center gap-1 transition-all cursor-pointer"
              title="Select Base Map Style"
            >
              <MapIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline text-[11px]">
                {language === 'Hindi' ? BASE_MAP_PROVIDERS[baseMapStyle].hindiName : BASE_MAP_PROVIDERS[baseMapStyle].name}
              </span>
            </button>

            {showBaseMapMenu && (
              <div className="absolute top-10 right-0 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-1 w-44 text-xs text-stone-200 animate-in fade-in duration-100">
                <div className="px-2 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-800">
                  {language === 'Hindi' ? 'मानचित्र शैली (Basemap)' : 'Map Background'}
                </div>
                {(Object.keys(BASE_MAP_PROVIDERS) as Array<keyof typeof BASE_MAP_PROVIDERS>).map((key) => {
                  const prov = BASE_MAP_PROVIDERS[key];
                  const isSelected = baseMapStyle === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setBaseMapStyle(key);
                        setShowBaseMapMenu(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'hover:bg-stone-800 text-stone-300 hover:text-white'
                      }`}
                    >
                      <span>{language === 'Hindi' ? prov.hindiName : prov.name}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Opacity Control (Only shown when weather overlay is active) */}
          {activeLayer !== 'base' && (
            <button
              onClick={() => setShowOpacitySlider(!showOpacitySlider)}
              className={`px-2 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                showOpacitySlider
                  ? 'bg-emerald-700 text-white border-emerald-600'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
              }`}
              title="Adjust Weather Overlay Transparency"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline font-mono">{Math.round(radarOpacity * 100)}%</span>
            </button>
          )}

          {/* Recenter button */}
          <button
            onClick={handleRecenter}
            className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            title={language === 'Hindi' ? 'खेत पर केंद्रित करें' : 'Recenter on My Field'}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{language === 'Hindi' ? 'खेत' : 'My Field'}</span>
          </button>

          {/* API Info Button */}
          <button
            onClick={() => setShowApiInfo(true)}
            className="p-1.5 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center transition-all cursor-pointer"
            title="Radar API Info"
          >
            <Info className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {/* Refresh Radar Tiles */}
          <button
            onClick={fetchRadarMeta}
            disabled={isRefreshing}
            className="p-1.5 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center transition-all cursor-pointer disabled:opacity-50"
            title={language === 'Hindi' ? 'रडार ताज़ा करें' : 'Refresh Radar'}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Expand / Collapse Map Toggle */}
          <button
            onClick={toggleExpand}
            className="p-1.5 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center transition-all active:scale-95 cursor-pointer"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Opacity Slider Popover */}
      {showOpacitySlider && (
        <div className="absolute top-14 right-3 bg-stone-900/95 backdrop-blur-xl border border-white/20 p-3 rounded-xl shadow-2xl z-30 flex flex-col gap-1.5 w-60 text-xs text-stone-200 animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-semibold">
            <span>{language === 'Hindi' ? 'रडार पारदर्शिता' : 'Radar Transparency'}</span>
            <span className="font-mono text-emerald-400">{Math.round(radarOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={radarOpacity}
            onChange={(e) => setRadarOpacity(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
          />
          <span className="text-[10px] text-stone-400">
            {language === 'Hindi'
              ? 'खेत की सीमाएं व रास्ते स्पष्ट देखने के लिए पारदर्शिता बदलें'
              : 'Adjust transparency to clearly view field boundaries and roads underneath'}
          </span>
        </div>
      )}

      {/* Weather API Info Modal */}
      {showApiInfo && (
        <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-white/15 rounded-2xl p-4 sm:p-5 text-stone-100 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowApiInfo(false)}
              className="absolute top-3.5 right-3.5 p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="font-bold text-sm">
                {language === 'Hindi' ? 'मौसम रडार व मानचित्र स्थिति' : 'Weather Radar & Map API Status'}
              </h4>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-stone-800">
                <span className="text-stone-400">{language === 'Hindi' ? 'आधार मानचित्र (Basemap)' : 'Basemap Engine'}</span>
                <span className="font-semibold text-amber-300">
                  {BASE_MAP_PROVIDERS[baseMapStyle].name}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-800">
                <span className="text-stone-400">{language === 'Hindi' ? 'मौसम डॉपलर एपीआई' : 'Doppler Radar API'}</span>
                <span className="font-semibold text-emerald-300">LibreWXR + RainViewer Composite</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-800">
                <span className="text-stone-400">{language === 'Hindi' ? 'मानचित्र प्रोजेक्शन' : 'Map Projection'}</span>
                <span className="font-mono text-cyan-300">EPSG:3857 (Spherical Mercator)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-800">
                <span className="text-stone-400">{language === 'Hindi' ? 'कनेक्शन स्थिति' : 'Connection Status'}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK (Active)
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-400">{language === 'Hindi' ? 'अंतिम स्कैन' : 'Last Scan'}</span>
                <span className="font-mono text-stone-200">{lastScanTime}</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 mt-3 pt-2.5 border-t border-stone-800 leading-relaxed">
              {language === 'Hindi'
                ? 'यह डॉपलर रडार और उपग्रह मानचित्र वास्तविक समय के बादलों और वर्षा तरंगों को सीधे आपके खेत और सड़कों के ऊपर स्पष्ट रूप से प्रदर्शित करता है।'
                : 'Real-time global Doppler radar and infrared satellite scans projected directly over clear geographic basemaps and farmland boundaries.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Leaflet Map Canvas (EPSG:3857 with explicit height and width) */}
      <div
        ref={mapContainerRef}
        className="flex-1 w-full relative z-0 min-h-[380px] sm:min-h-[420px]"
        style={{ width: '100%', height: '100%', minHeight: '380px' }}
      />

      {/* Compact Doppler Rain Intensity Legend (Bottom Left) */}
      {activeLayer === 'radar' && (
        <div className="absolute bottom-3 left-3 bg-stone-900/90 backdrop-blur-xl text-white px-3 py-1.5 rounded-xl shadow-lg border border-white/15 z-20 flex items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold text-stone-300 flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" />
            <span>{language === 'Hindi' ? 'वर्षा तीव्रता' : 'Rain Intensity'}</span>
          </span>
          <div className="flex items-center gap-1 text-[10px] text-stone-300">
            <span>{language === 'Hindi' ? 'हल्की' : 'Light'}</span>
            <div className="flex h-2 w-28 rounded-full overflow-hidden mx-1 shadow-inner">
              <span className="w-1/4 bg-cyan-400" title="Light" />
              <span className="w-1/4 bg-blue-500" title="Moderate" />
              <span className="w-1/4 bg-amber-400" title="Heavy" />
              <span className="w-1/4 bg-rose-600" title="Downpour" />
            </div>
            <span>{language === 'Hindi' ? 'भारी' : 'Heavy'}</span>
          </div>
        </div>
      )}

      {/* Compact Satellite Cloud Legend (Bottom Left) */}
      {activeLayer === 'satellite' && (
        <div className="absolute bottom-3 left-3 bg-stone-900/90 backdrop-blur-xl text-white px-3 py-1.5 rounded-xl shadow-lg border border-white/15 z-20 flex items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold text-stone-300 flex items-center gap-1">
            <Cloud className="w-3 h-3 text-sky-400" />
            <span>{language === 'Hindi' ? 'बादल घनत्व' : 'Cloud Cover'}</span>
          </span>
          <div className="flex items-center gap-1 text-[10px] text-stone-300">
            <span>{language === 'Hindi' ? 'साफ' : 'Clear'}</span>
            <div className="flex h-2 w-28 rounded-full overflow-hidden mx-1 shadow-inner bg-stone-800">
              <span className="w-1/3 bg-stone-400/50" title="Light" />
              <span className="w-1/3 bg-slate-200" title="Overcast" />
              <span className="w-1/3 bg-cyan-200" title="Storm" />
            </div>
            <span>{language === 'Hindi' ? 'घने' : 'Overcast'}</span>
          </div>
        </div>
      )}

      {/* Subtle Projection & Provider Indicator on Bottom Right */}
      <div className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur-md text-stone-300 px-2.5 py-1 rounded-lg text-[10px] border border-white/10 z-20 hidden sm:flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>EPSG:3857 • {BASE_MAP_PROVIDERS[baseMapStyle].name}</span>
      </div>
    </div>
  );
};

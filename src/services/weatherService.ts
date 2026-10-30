import {
  CurrentWeather,
  DailyItem,
  HourlyItem,
  LocationItem,
  WeatherAlert,
  AgriculturalIndex,
} from '../types';

export const INDIAN_AGRICULTURAL_PRESETS: LocationItem[] = [
  { id: 'nashik', name: 'Nashik (नाशिक)', district: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898, label: 'Grape & Onion Hub' },
  { id: 'ludhiana', name: 'Ludhiana (ਲੁਧਿਆਣਾ)', district: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573, label: 'Wheat & Rice Belt' },
  { id: 'karnal', name: 'Karnal (करनाल)', district: 'Karnal', state: 'Haryana', lat: 29.6857, lon: 76.9905, label: 'Basmati Rice Hub' },
  { id: 'guntur', name: 'Guntur (గుంటూరు)', district: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365, label: 'Chilli & Cotton Belt' },
  { id: 'thanjavur', name: 'Thanjavur (தஞ்சாவூர்)', district: 'Thanjavur', state: 'Tamil Nadu', lat: 10.7870, lon: 79.1378, label: 'Cauvery Rice Bowl' },
  { id: 'mandya', name: 'Mandya (ಮಂಡ್ಯ)', district: 'Mandya', state: 'Karnataka', lat: 12.5230, lon: 76.8967, label: 'Sugarcane & Paddy' },
  { id: 'anand', name: 'Anand (આણંદ)', district: 'Anand', state: 'Gujarat', lat: 22.5645, lon: 72.9289, label: 'Vegetable & Dairy Belt' },
  { id: 'kota', name: 'Kota (कोटा)', district: 'Kota', state: 'Rajasthan', lat: 25.2138, lon: 75.8648, label: 'Soybean & Mustard Hub' },
  { id: 'varanasi', name: 'Varanasi (वाराणसी)', district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739, label: 'Eastern Gangetic Plains' },
  { id: 'indore', name: 'Indore (इंदौर)', district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577, label: 'Malwa Soybean Region' },
  { id: 'bardhaman', name: 'Bardhaman (বর্ধমান)', district: 'Purba Bardhaman', state: 'West Bengal', lat: 23.2324, lon: 87.8615, label: 'Rice Bowl of Bengal' },
  { id: 'sambalpur', name: 'Sambalpur (ସମ୍ବଲପୁର)', district: 'Sambalpur', state: 'Odisha', lat: 21.4669, lon: 83.9812, label: 'Hirakud Command Area' },
  { id: 'palakkad', name: 'Palakkad (പാലക്കാട്)', district: 'Palakkad', state: 'Kerala', lat: 10.7867, lon: 76.6548, label: 'Granary of Kerala' },
  { id: 'bhatinda', name: 'Bathinda (ਬਠਿੰਡਾ)', district: 'Bathinda', state: 'Punjab', lat: 30.2110, lon: 74.9455, label: 'Cotton & Wheat Belt' },
  { id: 'muzaffarpur', name: 'Muzaffarpur (मुजफ्फरपुर)', district: 'Muzaffarpur', state: 'Bihar', lat: 26.1209, lon: 85.3647, label: 'Shahi Litchi & Maize' },
];

export function getWeatherConditionName(code: number, lang: string = 'Hindi'): string {
  // WMO Weather interpretation codes
  const conditions: Record<number, { en: string; hi: string; icon: string }> = {
    0: { en: 'Clear sky', hi: 'साफ़ आसमान', icon: 'sun' },
    1: { en: 'Mainly clear', hi: 'मुख्यतः साफ़', icon: 'sun' },
    2: { en: 'Partly cloudy', hi: 'आंशिक बादल', icon: 'cloud-sun' },
    3: { en: 'Overcast', hi: 'घने बादल', icon: 'cloud' },
    45: { en: 'Fog / Mist', hi: 'कोहरा / धुंध', icon: 'cloud-fog' },
    48: { en: 'Depositing rime fog', hi: 'घना कोहरा', icon: 'cloud-fog' },
    51: { en: 'Light drizzle', hi: 'हल्की बूंदाबांदी', icon: 'cloud-drizzle' },
    53: { en: 'Moderate drizzle', hi: 'बूंदाबांदी', icon: 'cloud-drizzle' },
    55: { en: 'Dense drizzle', hi: 'सघन बूंदाबांदी', icon: 'cloud-drizzle' },
    61: { en: 'Slight rain', hi: 'हल्की बारिश', icon: 'cloud-rain' },
    63: { en: 'Moderate rain', hi: 'मध्यम वर्षा', icon: 'cloud-rain' },
    65: { en: 'Heavy rain', hi: 'भारी बारिश', icon: 'cloud-rain-wind' },
    71: { en: 'Slight snow / hail risk', hi: 'हल्के ओले / पाला', icon: 'snowflake' },
    73: { en: 'Moderate snowfall', hi: 'बर्फबारी / पाला', icon: 'snowflake' },
    75: { en: 'Heavy snowfall', hi: 'तीव्र पाला', icon: 'snowflake' },
    80: { en: 'Rain showers', hi: 'बारिश की बौछारें', icon: 'cloud-rain' },
    81: { en: 'Moderate showers', hi: 'तेज़ बौछारें', icon: 'cloud-rain' },
    82: { en: 'Violent showers', hi: 'मूसलाधार बौछारें', icon: 'cloud-rain-wind' },
    95: { en: 'Thunderstorm', hi: 'गरज-चमक के साथ आंधी', icon: 'cloud-lightning' },
    96: { en: 'Thunderstorm with slight hail', hi: 'आंधी और ओलावृष्टि', icon: 'cloud-hail' },
    99: { en: 'Thunderstorm with heavy hail', hi: 'तीव्र ओलावृष्टि व तूफान', icon: 'cloud-hail' },
  };

  const match = conditions[code] || { en: 'Fair weather', hi: 'अनुकूल मौसम', icon: 'cloud-sun' };
  return lang === 'English' ? match.en : match.hi;
}

export function parseWeatherData(raw: any, lang: string = 'Hindi'): {
  current: CurrentWeather;
  hourly: HourlyItem[];
  daily: DailyItem[];
  agriIndex: AgriculturalIndex;
} {
  const currentRaw = raw.current || {};
  const hourlyRaw = raw.hourly || {};
  const dailyRaw = raw.daily || {};

  const temp = Math.round(currentRaw.temperature_2m ?? 28);
  const feelsLike = Math.round(currentRaw.apparent_temperature ?? temp);
  const humidity = Math.round(currentRaw.relative_humidity_2m ?? 50);
  const windSpeed = Math.round(currentRaw.wind_speed_10m ?? 8);
  const windGusts = Math.round(currentRaw.wind_gusts_10m ?? windSpeed * 1.3);
  const windDirection = currentRaw.wind_direction_10m ?? 0;
  const cloudCover = Math.round(currentRaw.cloud_cover ?? 10);
  const pressure = Math.round(currentRaw.pressure_msl ?? 1012);
  const weatherCode = currentRaw.weather_code ?? 0;
  const isDay = currentRaw.is_day === 1;

  // Daily min/max for today
  const tempMax = Math.round(dailyRaw.temperature_2m_max?.[0] ?? temp + 3);
  const tempMin = Math.round(dailyRaw.temperature_2m_min?.[0] ?? temp - 4);
  const rainProbability = Math.round(
    dailyRaw.precipitation_probability_max?.[0] ?? (currentRaw.precipitation ? 80 : 15)
  );
  const rainMm = Number((dailyRaw.precipitation_sum?.[0] ?? currentRaw.precipitation ?? 0).toFixed(1));
  const sunrise = dailyRaw.sunrise?.[0]?.split('T')[1]?.slice(0, 5) || '06:05';
  const sunset = dailyRaw.sunset?.[0]?.split('T')[1]?.slice(0, 5) || '18:25';
  const uvIndex = Math.round(dailyRaw.uv_index_max?.[0] ?? 6);

  // Evaluate IMD style warning
  let alert: WeatherAlert | undefined = undefined;
  if ([95, 96, 99].includes(weatherCode)) {
    alert = {
      id: 'alert_thunderstorm',
      type: 'thunderstorm',
      severity: weatherCode === 99 ? 'red' : 'orange',
      title: lang === 'English' ? 'IMD Warning: Thunderstorm & Lightning' : 'मौसम विभाग चेतावनी: आंधी-तूफान व बिजली गिरने की आशंका',
      description: lang === 'English' 
        ? 'Severe convective clouds detected. High risk of gusty winds and lightning strikes.'
        : 'गंभीर संवहनी बादल सक्रिय हैं। तेज आंधी और आकाशीय बिजली का गंभीर जोखिम है।',
      actionableAdvice: lang === 'English'
        ? 'Avoid open fields and standing under trees. Suspend pesticide spraying and secure harvested produce.'
        : 'खुले खेतों में काम रोकें, ऊंचे पेड़ों के नीचे न जाएं। कटी फसल तिरपाल से ढकें और छिड़काव स्थगित रखें।',
      source: 'IMD Threshold Criteria',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  } else if (rainMm >= 40 || rainProbability >= 80) {
    alert = {
      id: 'alert_heavy_rain',
      type: 'heavy_rain',
      severity: rainMm >= 65 ? 'red' : 'orange',
      title: lang === 'English' ? 'IMD Warning: Heavy Rainfall Expected' : 'चेतावनी: भारी वर्षा का अनुमान',
      description: lang === 'English'
        ? `Expected accumulation of ${rainMm} mm with high precipitation probability.`
        : `क्षेत्र में ${rainMm} mm तक वर्षा और जलभराव का अनुमान है।`,
      actionableAdvice: lang === 'English'
        ? 'Withhold irrigation immediately. Clear field drainage channels to prevent waterlogging around roots.'
        : 'तुरंत सिंचाई बंद करें। खेत की नालियां साफ़ रखें ताकि जड़ों में पानी न भरे।',
      source: 'IMD Agromet Advisory',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  } else if (tempMax >= 40 || feelsLike >= 43) {
    alert = {
      id: 'alert_heatwave',
      type: 'heatwave',
      severity: tempMax >= 43 ? 'red' : 'yellow',
      title: lang === 'English' ? 'IMD Alert: Heatwave & Heat Stress' : 'सतर्कता: भीषण गर्मी व लू (Heatwave)',
      description: lang === 'English'
        ? `Daytime temperatures soaring to ${tempMax}°C, creating severe moisture stress.`
        : `दिन का तापमान ${tempMax}°C तक पहुंच रहा है, जिससे फसल में नमी की कमी हो सकती है।`,
      actionableAdvice: lang === 'English'
        ? 'Provide light evening irrigation to maintain root zone humidity. Apply mulching to retain soil moisture.'
        : 'शाम के समय हल्की सिंचाई दें जिससे मिट्टी में ठंडक रहे। कतारों के बीच पुआल या मल्चिंग का उपयोग करें।',
      source: 'IMD Heatwave Advisory',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  } else if (windSpeed >= 28 || windGusts >= 40) {
    alert = {
      id: 'alert_wind',
      type: 'strong_wind',
      severity: 'yellow',
      title: lang === 'English' ? 'Advisory: Strong Gusty Winds' : 'परामर्श: तेज हवाएं व झोंके',
      description: lang === 'English'
        ? `Wind speeds reaching ${windSpeed} km/h with gusts up to ${windGusts} km/h.`
        : `हवा की गति ${windSpeed} km/h और झोंके ${windGusts} km/h तक रहने का अनुमान।`,
      actionableAdvice: lang === 'English'
        ? 'Do not spray pesticides or foliar fertilizers due to spray drift. Support tall crops (banana, sugarcane).'
        : 'कीटनाशक छिड़काव बिल्कुल न करें क्योंकि दवा हवा में उड़ जाएगी। केले, गन्ने व पपीते को सहारा दें।',
      source: 'Krishi Weather Guard',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // Parse Hourly Forecast (Next 36-48 Hours)
  const hourly: HourlyItem[] = [];
  const hourlyTimes = hourlyRaw.time || [];
  const currentHourIso = new Date().toISOString().slice(0, 13);
  let startIndex = hourlyTimes.findIndex((t: string) => t.startsWith(currentHourIso));
  if (startIndex === -1) startIndex = 0;

  for (let i = startIndex; i < Math.min(startIndex + 48, hourlyTimes.length); i++) {
    const rawTime = hourlyTimes[i];
    const dateObj = new Date(rawTime);
    const hourNum = dateObj.getHours();
    const hourDisplay = dateObj.toLocaleTimeString([], { hour: 'numeric', hour12: true });

    const hTemp = Math.round(hourlyRaw.temperature_2m?.[i] ?? temp);
    const hRainProb = Math.round(hourlyRaw.precipitation_probability?.[i] ?? 0);
    const hRainMm = Number((hourlyRaw.precipitation?.[i] ?? 0).toFixed(1));
    const hWind = Math.round(hourlyRaw.wind_speed_10m?.[i] ?? 5);
    const hWindDir = hourlyRaw.wind_direction_10m?.[i] ?? 0;
    const hUv = Math.round(hourlyRaw.uv_index?.[i] ?? 0);
    const hCode = hourlyRaw.weather_code?.[i] ?? 0;
    const hIsDay = hourlyRaw.is_day?.[i] === 1;

    // Evaluate spraying suitability for this specific hour
    let spraySuitability: 'good' | 'moderate' | 'unsuitable' = 'good';
    let note = '';

    if (hRainProb > 30 || hRainMm > 0.2) {
      spraySuitability = 'unsuitable';
      note = lang === 'English' ? 'Rain risk - chemical runoff' : 'बारिश की आशंका - दवा धुलने का डर';
    } else if (hWind > 16) {
      spraySuitability = 'unsuitable';
      note = lang === 'English' ? 'High wind - chemical drift' : 'तेज़ हवा - दवा उड़ने का खतरा';
    } else if (hTemp > 34) {
      spraySuitability = 'moderate';
      note = lang === 'English' ? 'High heat - spray early morning' : 'अधिक तापमान - सुबह ही छिड़कें';
    } else if (hourNum >= 6 && hourNum <= 10) {
      spraySuitability = 'good';
      note = lang === 'English' ? 'Golden spray window' : 'छिड़काव का सबसे उत्तम समय';
    } else if (hourNum >= 16 && hourNum <= 19) {
      spraySuitability = 'good';
      note = lang === 'English' ? 'Favorable evening window' : 'शाम का उत्तम समय';
    }

    hourly.push({
      time: rawTime,
      hourDisplay,
      temp: hTemp,
      rainProbability: hRainProb,
      rainMm: hRainMm,
      windSpeed: hWind,
      windDirection: hWindDir,
      uvIndex: hUv,
      weatherCode: hCode,
      condition: getWeatherConditionName(hCode, lang),
      isDay: hIsDay,
      spraySuitability,
      note,
    });
  }

  // Parse Daily Forecast (7 Days)
  const daily: DailyItem[] = [];
  const dailyTimes = dailyRaw.time || [];
  for (let i = 0; i < Math.min(7, dailyTimes.length); i++) {
    const rawDate = dailyRaw.time[i];
    const dateObj = new Date(rawDate);
    const isToday = i === 0;
    const isTomorrow = i === 1;
    let dayDisplay = isToday
      ? (lang === 'English' ? 'Today' : 'आज')
      : isTomorrow
      ? (lang === 'English' ? 'Tomorrow' : 'कल')
      : dateObj.toLocaleDateString(lang === 'English' ? 'en-IN' : 'hi-IN', { weekday: 'short', day: 'numeric', month: 'short' });

    const dMax = Math.round(dailyRaw.temperature_2m_max?.[i] ?? tempMax);
    const dMin = Math.round(dailyRaw.temperature_2m_min?.[i] ?? tempMin);
    const dAppMax = Math.round(dailyRaw.apparent_temperature_max?.[i] ?? dMax);
    const dAppMin = Math.round(dailyRaw.apparent_temperature_min?.[i] ?? dMin);
    const dRainProb = Math.round(dailyRaw.precipitation_probability_max?.[i] ?? 10);
    const dRainMm = Number((dailyRaw.precipitation_sum?.[i] ?? 0).toFixed(1));
    const dWindMax = Math.round(dailyRaw.wind_speed_10m_max?.[i] ?? 12);
    const dWindGust = Math.round(dailyRaw.wind_gusts_10m_max?.[i] ?? 18);
    const dWindDir = dailyRaw.wind_direction_10m_dominant?.[i] ?? 0;
    const dUv = Math.round(dailyRaw.uv_index_max?.[i] ?? 6);
    const dCode = dailyRaw.weather_code?.[i] ?? 0;
    const dSunrise = dailyRaw.sunrise?.[i]?.split('T')[1]?.slice(0, 5) || '06:00';
    const dSunset = dailyRaw.sunset?.[i]?.split('T')[1]?.slice(0, 5) || '18:30';

    let agriAlert = '';
    let irrigationAdvice = '';

    if (dRainMm >= 15 || dRainProb >= 65) {
      agriAlert = lang === 'English' ? 'Heavy rain: Drainage alert' : 'तेज बारिश: जलभराव से बचाव करें';
      irrigationAdvice = lang === 'English' ? 'Withhold irrigation' : 'सिंचाई पूरी तरह स्थगित रखें';
    } else if (dMax >= 39) {
      agriAlert = lang === 'English' ? 'Heat stress: Keep roots moist' : 'गर्मी का तनाव: हल्की सिंचाई दें';
      irrigationAdvice = lang === 'English' ? 'Irrigate in cool hours' : 'शाम को ठंडा होने पर पानी दें';
    } else if (dWindMax >= 25) {
      agriAlert = lang === 'English' ? 'High wind: Avoid foliar spray' : 'तेज हवा: छिड़काव न करें';
      irrigationAdvice = lang === 'English' ? 'Light irrigation if needed' : 'सामान्य आवश्यकता अनुसार';
    } else {
      agriAlert = lang === 'English' ? 'Optimal for field operations' : 'कृषि कार्यों के लिए श्रेष्ठ दिन';
      irrigationAdvice = lang === 'English' ? 'Normal schedule' : 'सामान्य अनुसूची का पालन करें';
    }

    daily.push({
      date: rawDate,
      dayDisplay,
      tempMax: dMax,
      tempMin: dMin,
      apparentMax: dAppMax,
      apparentMin: dAppMin,
      rainProbability: dRainProb,
      rainMm: dRainMm,
      windSpeedMax: dWindMax,
      windGustMax: dWindGust,
      windDirection: dWindDir,
      uvIndexMax: dUv,
      weatherCode: dCode,
      condition: getWeatherConditionName(dCode, lang),
      sunrise: dSunrise,
      sunset: dSunset,
      agriAlert,
      irrigationAdvice,
    });
  }

  // Calculate Agricultural Composite Index
  // Spray Score calculation
  let sprayScore = 90;
  if (rainProbability > 40) sprayScore -= 45;
  if (rainMm > 1) sprayScore -= 40;
  if (windSpeed > 15) sprayScore -= (windSpeed - 15) * 4;
  if (temp > 35) sprayScore -= 20;
  sprayScore = Math.max(10, Math.min(98, Math.round(sprayScore)));

  let sprayStatus: 'ideal' | 'caution' | 'unsafe' = 'ideal';
  let sprayReason = '';
  if (sprayScore < 45) {
    sprayStatus = 'unsafe';
    sprayReason = lang === 'English'
      ? 'High risk of rain or strong wind will waste expensive chemicals.'
      : 'बारिश या तेज़ हवा से दवा बहने या उड़ने का गंभीर जोखिम है। छिड़काव स्थगित रखें।';
  } else if (sprayScore < 75) {
    sprayStatus = 'caution';
    sprayReason = lang === 'English'
      ? 'Spray only during calm early morning hours before wind picks up.'
      : 'केवल सुबह शांत मौसम में छिड़कें जब हवा धीमी हो और धूप तेज न हुई हो।';
  } else {
    sprayStatus = 'ideal';
    sprayReason = lang === 'English'
      ? 'Clear sky, low wind speed, and dry canopy make this an optimal spray window.'
      : 'साफ़ मौसम, मंद हवा और शुष्क पत्तियां छिड़काव के लिए सर्वोत्तम अवसर हैं।';
  }

  // Irrigation Guidance
  const next48hRain = daily.slice(0, 2).reduce((acc, d) => acc + d.rainMm, 0);
  let irrigationStatus: 'withhold' | 'apply' | 'monitor' = 'monitor';
  let irrigationReason = '';
  if (next48hRain >= 12 || rainProbability >= 60) {
    irrigationStatus = 'withhold';
    irrigationReason = lang === 'English'
      ? `Rain (${next48hRain.toFixed(1)} mm) forecast within 48h. Save electricity, diesel, and prevent root rot.`
      : `अगले 48 घंटे में ${next48hRain.toFixed(1)} mm बारिश का अनुमान। सिंचाई रोकें ताकि बिजली/डीजल बचे और जड़ें न गलें।`;
  } else if (tempMax >= 37 && next48hRain < 2) {
    irrigationStatus = 'apply';
    irrigationReason = lang === 'English'
      ? 'High temperature and intense sunshine increasing soil evapotranspiration. Irrigate in evening.'
      : 'कड़ाके की धूप और तापमान बढ़ने से नमी तेज़ी से उड़ रही है। शाम को खेत में पानी अवश्य लगाएं।';
  } else {
    irrigationStatus = 'monitor';
    irrigationReason = lang === 'English'
      ? 'Check soil moisture at 4-inch depth before operating pumps.'
      : 'खेत में 4 इंच गहराई पर मिट्टी की नमी देखकर ही ट्यूबवेल या नहर का पानी चलाएं।';
  }

  const agriIndex: AgriculturalIndex = {
    sprayScore,
    sprayStatus,
    sprayReason,
    irrigationStatus,
    irrigationReason,
    heatColdStress: tempMax >= 40 ? 'extreme_heat' : tempMax >= 36 ? 'moderate_heat' : tempMin <= 4 ? 'frost_risk' : 'none',
    harvestSuitability: next48hRain < 2 && rainProbability < 25 ? 'favorable' : 'risky',
  };

  const current: CurrentWeather = {
    temp,
    feelsLike,
    tempMin,
    tempMax,
    humidity,
    rainProbability,
    rainMm,
    windSpeed,
    windDirection,
    windGusts,
    cloudCover,
    uvIndex,
    pressure,
    weatherCode,
    condition: getWeatherConditionName(weatherCode, lang),
    isDay,
    sunrise,
    sunset,
    alert,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  return { current, hourly, daily, agriIndex };
}

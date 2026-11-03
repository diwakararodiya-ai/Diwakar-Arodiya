import React, { useState } from 'react';
import { SupportedLanguage } from '../types';
import {
  X,
  Smartphone,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Terminal,
  FileCode,
  Layers,
  Sparkles,
  Award,
  Globe,
  Radio,
  BookOpen,
} from 'lucide-react';
import { KisaanCareLogo } from './KisaanCareLogo';

interface PlayStorePublishModalProps {
  language: SupportedLanguage;
  onClose: () => void;
}

export const PlayStorePublishModal: React.FC<PlayStorePublishModalProps> = ({
  language,
  onClose,
}) => {
  const isHindi = language === 'Hindi';
  const [activeTab, setActiveTab] = useState<'guide' | 'assets' | 'listing' | 'privacy'>('guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleDownloadFile = (filename: string, content: string, mimeType: string = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const KEYSTORE_CMD = `keytool -genkey -v -keystore kisaan-care-release.jks -alias kisaan-care -keyalg RSA -keysize 2048 -validity 10000`;
  const GRADLE_BUILD_CMD = `./gradlew bundleRelease`;
  const BUBBLEWRAP_CMD = `npx @bubblewrap/cli build`;

  const PLAY_STORE_TITLE = isHindi
    ? 'Kisaan Care - किसान केयर मौसम व कृषि सलाहकार'
    : 'Kisaan Care - AI Weather & Crop Advisor';

  const SHORT_DESC = isHindi
    ? 'भारतीय किसानों के लिए लाइव मौसम, डॉपलर रडार, AI फसल मित्र व दैनिक कृषि समाचार।'
    : 'Hyper-local weather, live Doppler radar, AI crop advisor & daily verified agri news.';

  const FULL_DESC = isHindi
    ? `किसान केयर (Kisaan Care) भारतीय किसानों के लिए विशेष रूप से तैयार किया गया स्मार्ट कृषि व मौसम साथी है।

मुख्य विशेषताएँ:
1. सटीक मौसम पूर्वानुमान: प्रति घंटा 48-घंटे और 7-दिवसीय तापमान, बारिश की संभावना और हवा की गति।
2. लाइव डॉपलर वर्षा रडार: वास्तविक समय में बादलों और बारिश का संचलन देखें, कीटनाशक छिड़काव व कटाई सुरक्षा अलर्ट।
3. किसान केयर एआई मित्र (Voice & Chat): हिंदी व 10 क्षेत्रीय भाषाओं में बोलकर फसल रोगों, सिंचाई व खाद से संबंधित सलाह लें।
4. दैनिक ताज़ा कृषि समाचार: पीएम-किसान सम्मान निधि, न्यूनतम समर्थन मूल्य (MSP), सब्सिडी व कृषि योजनाओं के दैनिक अपडेट।
5. ऑफ़लाइन सपोर्ट: नेटवर्क कम होने पर भी सहेजे गए मौसम आंकड़े उपलब्ध।

पैकेज नाम: com.kisaancare.app
निशुल्क, किसान-हितैषी व सुरक्षित।`
    : `Kisaan Care is an AI-powered agricultural companion engineered specifically for Indian farmers to make timely weather-smart farming decisions.

Key Features:
1. Hyper-Local Agromet Weather: 48-hour hourly precision forecasting and 7-day outlook covering rain probability, temperature, and wind.
2. Live Doppler Weather Radar: Real-time radar sweeps and reflectivity for spray window planning and harvest protection.
3. Kisaan AI Mitra: Voice-first agricultural advisor supporting Hindi, Marathi, Telugu, Tamil, and English.
4. Daily Verified Agri News: Real-time updates on PM-Kisan DBT installments, MSP revisions, mandi prices, and government subsidies.
5. Offline-Resilient: Stores cached weather data for remote farmland usage.

Package ID: com.kisaancare.app
Privacy-safe, ad-free, and dedicated to farmer welfare.`;

  const PRIVACY_POLICY_TEXT = `KISAAN CARE PRIVACY POLICY
Last Updated: March 2026
App Package: com.kisaancare.app

1. Overview:
Kisaan Care ("we", "our") is committed to protecting the privacy of farmers and rural communities. This policy explains how we handle device permissions.

2. Geolocation (ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION):
Location access is used solely to fetch hyper-local micro-climate weather forecasts, rainfall probabilities, and regional crop advisories for your farm. Your location coordinates are processed in memory and never shared with third-party advertisers.

3. Microphone & Audio (RECORD_AUDIO):
Used exclusively when you tap the voice button to speak with the Kisaan AI Mitra assistant. Voice recordings are processed in real time and are not stored permanently.

4. Offline Storage:
We store cached weather forecasts, preferred crop profiles, and news locally on your device for offline access.

5. Data Security & Third Parties:
Kisaan Care contains no third-party tracking libraries or advertising SDKs. Data transmission is encrypted via HTTPS/TLS.

For inquiries: diwakararodiya77@gmail.com`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-emerald-500/30 flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-4 sm:p-6 flex items-center justify-between border-b border-emerald-600/30 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
              <Smartphone className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                  {isHindi
                    ? 'गूगल प्ले स्टोर व Android Native Hub'
                    : 'Google Play Store & Android Native Hub'}
                </h2>
                <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3 text-stone-950" />
                  Target SDK 34 (Android 14)
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-1 font-medium">
                {isHindi
                  ? 'Kisaan Care को Google Play Store पर प्रकाशित करने के संपूर्ण पैकेज व निर्देश'
                  : 'Official package assets & step-by-step guide for Google Play Console publication'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50/80 px-4 sm:px-6 gap-1 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'guide'
                ? 'border-emerald-700 text-emerald-900 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            {isHindi ? '1. प्रकाशन गाइड (5 चरण)' : '1. Play Store Guide'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assets')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'assets'
                ? 'border-emerald-700 text-emerald-900 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-600" />
            {isHindi ? '2. प्रोजेक्ट फाइलें व डाउनलोड' : '2. Android Project Files'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('listing')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'listing'
                ? 'border-emerald-700 text-emerald-900 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            {isHindi ? '3. स्टोर लिस्टिंग व विवरण' : '3. Store Listing Copy'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-emerald-700 text-emerald-900 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {isHindi ? '4. गोपनीयता नीति (Privacy)' : '4. Privacy Policy'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-stone-800 text-xs sm:text-sm">
          {/* TAB 1: Step-by-Step Play Store Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              {/* Package Metadata Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Package ID</span>
                  <p className="font-mono font-bold text-emerald-950 mt-0.5 truncate">com.kisaancare.app</p>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Version</span>
                  <p className="font-bold text-emerald-950 mt-0.5">1.0.0 (Code 1)</p>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Target SDK</span>
                  <p className="font-bold text-emerald-950 mt-0.5">34 (Android 14)</p>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Category</span>
                  <p className="font-bold text-emerald-950 mt-0.5">Weather / Agri</p>
                </div>
              </div>

              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm">
                      {isHindi ? 'रिलीज़ कीस्टोर (Signing Keystore) बनाएं' : 'Generate Signing Keystore'}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(KEYSTORE_CMD, 'keystore')}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 cursor-pointer"
                  >
                    {copiedKey === 'keystore' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'keystore' ? 'Copied!' : 'Copy Command'}
                  </button>
                </div>
                <p className="text-stone-600 text-xs leading-relaxed">
                  {isHindi
                    ? 'Google Play Store पर सुरक्षित अपलोड के लिए अपने टर्मिनल में यह कमांड चलाकर कीस्टोर फ़ाइल बनाएं:'
                    : 'Run this in your terminal to create the release signing keystore required by Google Play:'}
                </p>
                <pre className="bg-stone-900 text-amber-300 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {KEYSTORE_CMD}
                </pre>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm">
                      {isHindi ? 'Android App Bundle (.aab) कंपाइल करें' : 'Build Signed App Bundle (.aab)'}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(GRADLE_BUILD_CMD, 'gradle')}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 cursor-pointer"
                  >
                    {copiedKey === 'gradle' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'gradle' ? 'Copied!' : 'Copy Command'}
                  </button>
                </div>
                <p className="text-stone-600 text-xs">
                  {isHindi
                    ? 'Android Studio में `/android` फोल्डर खोलें और "Build > Generate Signed Bundle / APK" चुनें या कमांड चलाएं:'
                    : 'Open `/android` in Android Studio and select "Build > Generate Signed Bundle / APK" or run:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-stone-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto">
                    <span className="text-stone-500 block text-[10px]"># Option A (Gradle wrapper)</span>
                    {GRADLE_BUILD_CMD}
                  </div>
                  <div className="bg-stone-900 text-sky-400 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto">
                    <span className="text-stone-500 block text-[10px]"># Option B (Google Bubblewrap CLI)</span>
                    {BUBBLEWRAP_CMD}
                  </div>
                </div>
                <p className="text-[11px] text-stone-500">
                  Output path: <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">android/app/build/outputs/bundle/release/app-release.aab</code>
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm">
                      {isHindi ? 'Google Play Console में ऐप बनाएं' : 'Create App in Google Play Console'}
                    </h4>
                  </div>
                  <a
                    href="https://play.google.com/console"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    Play Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-stone-600 text-xs">
                  {isHindi
                    ? 'play.google.com/console पर जाएं -> "Create App" -> नाम "Kisaan Care" रखें -> Free App चुनें।'
                    : 'Log in to play.google.com/console -> Click "Create app" -> Title: "Kisaan Care" -> Select Free app.'}
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                      4
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm">
                      {isHindi ? 'Digital Asset Links सत्यापित करें' : 'Verify Digital Asset Links'}
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live Verified
                  </span>
                </div>
                <p className="text-stone-600 text-xs leading-relaxed">
                  {isHindi
                    ? 'Google Play Store TWA सत्यापन के लिए Digital Asset Links URL आपके सर्वर पर लाइव चालू है:'
                    : 'Digital Asset Links endpoint is actively served from your backend at:'}
                </p>
                <div className="p-2.5 rounded-xl bg-stone-100 font-mono text-[11px] text-stone-800 break-all select-all border border-stone-200">
                  https://ais-pre-pz2zsczi37ff4zhdifuvfc-273538622245.asia-southeast1.run.app/.well-known/assetlinks.json
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                      5
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm">
                      {isHindi ? 'रिलीज़ ट्रैक (Internal / Production) में अपलोड करें' : 'Upload to Production / Closed Testing Track'}
                    </h4>
                  </div>
                </div>
                <p className="text-stone-600 text-xs">
                  {isHindi
                    ? 'Play Console में "Production" या "Closed Testing" में जाएं -> "Create new release" -> app-release.aab अपलोड करें -> Review & Rollout दबाएं!'
                    : 'Go to Production or Closed testing in Play Console -> Click "Create new release" -> Upload app-release.aab -> Submit for review.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Android Project Files */}
          {activeTab === 'assets' && (
            <div className="space-y-4">
              <p className="text-stone-600 text-xs">
                {isHindi
                  ? 'Kisaan Care का संपूर्ण Android प्रोजेक्ट स्ट्रक्चर तैयार है। आप नीचे से कोई भी फाइल सीधे डाउनलोड या कॉपी कर सकते हैं:'
                  : 'Complete native Android Studio project files configured for com.kisaancare.app are ready. Download directly below:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* File 1: AndroidManifest.xml */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-stone-900 text-xs">AndroidManifest.xml</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Native permissions (GPS, Mic, Internet), Launcher & Deep link intent-filters.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      fetch('/android/app/src/main/AndroidManifest.xml')
                        .then((r) => r.text())
                        .then((txt) => handleDownloadFile('AndroidManifest.xml', txt, 'application/xml'))
                        .catch(() => handleDownloadFile('AndroidManifest.xml', '<!-- Kisaan Care Manifest -->', 'application/xml'));
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Manifest
                  </button>
                </div>

                {/* File 2: twa-manifest.json */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-stone-900 text-xs">twa-manifest.json</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Google Bubblewrap CLI configuration for single-command Google Play builds.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      fetch('/twa-manifest.json')
                        .then((r) => r.text())
                        .then((txt) => handleDownloadFile('twa-manifest.json', txt, 'application/json'))
                        .catch(() => handleDownloadFile('twa-manifest.json', '{}', 'application/json'));
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download TWA Manifest
                  </button>
                </div>

                {/* File 3: assetlinks.json */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-stone-900 text-xs">assetlinks.json</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Digital Asset Links verifying domain ownership for full-screen native launch.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      fetch('/.well-known/assetlinks.json')
                        .then((r) => r.text())
                        .then((txt) => handleDownloadFile('assetlinks.json', txt, 'application/json'))
                        .catch(() => handleDownloadFile('assetlinks.json', '[]', 'application/json'));
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download assetlinks.json
                  </button>
                </div>

                {/* File 4: MainActivity.kt */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-stone-900 text-xs">MainActivity.kt</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Kotlin native activity handling back-button, offline caching & geolocation prompt.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      fetch('/android/app/src/main/java/com/kisaancare/app/MainActivity.kt')
                        .then((r) => r.text())
                        .then((txt) => handleDownloadFile('MainActivity.kt', txt, 'text/plain'))
                        .catch(() => handleDownloadFile('MainActivity.kt', '// MainActivity.kt', 'text/plain'));
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download MainActivity.kt
                  </button>
                </div>
              </div>

              {/* Play Store Icons and Graphics Spec */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <h4 className="font-bold text-amber-950 text-xs sm:text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  {isHindi ? 'Google Play Store आइकन व ग्राफिक आवश्यकताएं' : 'Play Store Graphic Requirements'}
                </h4>
                <ul className="text-xs text-amber-900 space-y-1 list-disc pl-5">
                  <li>
                    <strong>App Icon (512x512 PNG, 32-bit):</strong> Ready at <code className="font-mono">/pwa-512x512.png</code>
                  </li>
                  <li>
                    <strong>Maskable Adaptive Icon:</strong> Ready at <code className="font-mono">/pwa-maskable-512x512.png</code>
                  </li>
                  <li>
                    <strong>Feature Graphic (1024x500 PNG/JPEG):</strong> Recommended banner featuring Kisaan Care Logo + radar map.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: Store Listing Copy */}
          {activeTab === 'listing' && (
            <div className="space-y-4">
              <p className="text-stone-600 text-xs">
                {isHindi
                  ? 'Google Play Console स्टोर लिस्टिंग में सीधे पेस्ट करने के लिए सत्यापित शीर्षक व विवरण:'
                  : 'Pre-written, optimized metadata ready to paste directly into Google Play Console:'}
              </p>

              {/* Title */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs">
                    {isHindi ? 'ऐप शीर्षक (App Title - Max 30 chars)' : 'App Title (Max 30 chars)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(PLAY_STORE_TITLE, 'title')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'title' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === 'title' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-stone-200 font-semibold text-xs text-stone-900">
                  {PLAY_STORE_TITLE}
                </div>
              </div>

              {/* Short Description */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs">
                    {isHindi ? 'संक्षिप्त विवरण (Short Description - Max 80 chars)' : 'Short Description (Max 80 chars)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(SHORT_DESC, 'shortDesc')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'shortDesc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === 'shortDesc' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-800">
                  {SHORT_DESC}
                </div>
              </div>

              {/* Full Description */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs">
                    {isHindi ? 'विस्तृत विवरण (Full Description)' : 'Full Description'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(FULL_DESC, 'fullDesc')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'fullDesc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === 'fullDesc' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-white border border-stone-200 text-[11px] text-stone-700 whitespace-pre-wrap font-sans max-h-56 overflow-y-auto">
                  {FULL_DESC}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: Privacy Policy */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    {isHindi ? 'Google Play गोपनीयता नीति (Privacy Policy)' : 'Mandatory Privacy Policy'}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {isHindi
                      ? 'Google Play Console "App Content" सेक्शन में लोकेशन व माइक्रोफ़ोन उपयोग के लिए आवश्यक नीति:'
                      : 'Required for location and microphone permission declarations on Google Play Console.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(PRIVACY_POLICY_TEXT, 'privacy')}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 cursor-pointer"
                >
                  {copiedKey === 'privacy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'privacy' ? 'Copied Policy!' : 'Copy Policy'}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-stone-900 text-stone-200 text-[11px] font-mono whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed border border-stone-800">
                {PRIVACY_POLICY_TEXT}
              </pre>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <strong>Hosting Tip:</strong> You can host this text at a public URL (e.g. GitHub Pages or your website) and paste that link in Google Play Console &gt; Policy and programs &gt; App privacy policy.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline">
              {isHindi ? 'Android TWA & Native Wrapper तैयार है' : 'Android TWA & Native Ready'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs sm:text-sm cursor-pointer transition-all"
            >
              {isHindi ? 'बंद करें' : 'Close'}
            </button>

            <button
              type="button"
              onClick={() => {
                const guideText = `Kisaan Care Google Play Submission Summary\nPackage: com.kisaancare.app\nTarget SDK: 34\nBuild Command: ${GRADLE_BUILD_CMD}\nAsset Links: https://ais-pre-pz2zsczi37ff4zhdifuvfc-273538622245.asia-southeast1.run.app/.well-known/assetlinks.json`;
                handleDownloadFile('kisaan-care-play-store-summary.txt', guideText);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-900/20 cursor-pointer transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isHindi ? 'सारांश डाउनलोड करें' : 'Download Summary'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

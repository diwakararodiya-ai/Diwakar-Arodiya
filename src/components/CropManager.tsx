import React, { useState } from 'react';
import { CropProfile, CurrentWeather, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../translations';
import {
  Sprout,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface CropManagerProps {
  crops: CropProfile[];
  activeCropId: string;
  weather: CurrentWeather | null;
  language: SupportedLanguage;
  onSelectActiveCrop: (id: string) => void;
  onAddCrop: (crop: CropProfile) => void;
  onDeleteCrop: (id: string) => void;
  onUpdateCropStage: (id: string, stage: CropProfile['growthStage']) => void;
  onAskAiForCrop: (cropName: string, stage: string) => void;
}

const STAGES: { key: CropProfile['growthStage']; labelHi: string; labelEn: string; icon: string }[] = [
  { key: 'germination', labelHi: 'अंकुरण / बिजाई', labelEn: 'Germination / Sowing', icon: '🌱' },
  { key: 'vegetative', labelHi: 'कल्ले फूटना / शाखाएं', labelEn: 'Vegetative / Tillering', icon: '🌿' },
  { key: 'flowering', labelHi: 'बालियां / फूल आना', labelEn: 'Flowering / Heading', icon: '🌾' },
  { key: 'grain_filling', labelHi: 'दाना भरना / फली', labelEn: 'Grain Filling / Pods', icon: '🌽' },
  { key: 'maturity_harvest', labelHi: 'पकना / कटाई', labelEn: 'Maturity / Harvest', icon: '🚜' },
];

const COMMON_CROPS = [
  { nameHi: 'गेहूँ (Wheat)', nameEn: 'Wheat', variety: 'HD-2967 / Sharbati' },
  { nameHi: 'धान / चावल (Paddy)', nameEn: 'Rice / Paddy', variety: 'Pusa 1121 / Basmati' },
  { nameHi: 'कपास (Cotton)', nameEn: 'Cotton', variety: 'Bt Cotton' },
  { nameHi: 'सरसों (Mustard)', nameEn: 'Mustard', variety: 'Pusa Bold' },
  { nameHi: 'गन्ना (Sugarcane)', nameEn: 'Sugarcane', variety: 'Co 0238' },
  { nameHi: 'सोयाबीन (Soybean)', nameEn: 'Soybean', variety: 'JS 335' },
  { nameHi: 'टमाटर (Tomato)', nameEn: 'Tomato', variety: 'Abhinav / Hybrid' },
  { nameHi: 'प्याज (Onion)', nameEn: 'Onion', variety: 'Nashik Red' },
  { nameHi: 'मक्का (Maize)', nameEn: 'Maize', variety: 'Pioneer Hybrid' },
  { nameHi: 'चना (Chickpea)', nameEn: 'Chickpea', variety: 'Desi Chana' },
];

export const CropManager: React.FC<CropManagerProps> = ({
  crops,
  activeCropId,
  weather,
  language,
  onSelectActiveCrop,
  onAddCrop,
  onDeleteCrop,
  onUpdateCropStage,
  onAskAiForCrop,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.Hindi;
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [newCropName, setNewCropName] = useState('गेहूँ (Wheat)');
  const [newVariety, setNewVariety] = useState('');
  const [newFieldName, setNewFieldName] = useState('खेत 1 (Main Plot)');
  const [newStage, setNewStage] = useState<CropProfile['growthStage']>('vegetative');
  const [newIrrigation, setNewIrrigation] = useState<CropProfile['irrigationType']>('borewell_drip');

  const activeCrop = crops.find((c) => c.id === activeCropId) || crops[0];

  const handleCreateCrop = (e: React.FormEvent) => {
    e.preventDefault();
    const created: CropProfile = {
      id: `crop_${Date.now()}`,
      name: newCropName,
      variety: newVariety || 'Standard',
      fieldName: newFieldName || 'Farm Field',
      growthStage: newStage,
      irrigationType: newIrrigation,
      soilType: 'alluvial',
      sowingDate: new Date().toISOString().slice(0, 10),
    };
    onAddCrop(created);
    setIsAddingNew(false);
  };

  const getStageRiskAnalysis = (crop: CropProfile) => {
    if (!weather) return null;
    const isRainy = weather.rainProbability > 40 || weather.rainMm > 5;
    const isWindy = weather.windSpeed > 20;
    const isHot = weather.tempMax >= 38;

    if (crop.growthStage === 'flowering') {
      if (isRainy) {
        return {
          level: 'high',
          title: language === 'Hindi' ? 'फूल झड़ने व परागण प्रभावित होने का खतरा' : 'Risk of pollen wash & flower drop',
          advice: language === 'Hindi' ? 'बारिश के कारण परागण प्रभावित हो सकता है। कीटनाशक छिड़काव रोकें।' : 'Rain during flowering hampers pollination. Avoid spraying.',
        };
      }
      if (isHot) {
        return {
          level: 'medium',
          title: language === 'Hindi' ? 'उच्च तापमान से फूल सूखने का खतरा' : 'High temperature flower desiccation',
          advice: language === 'Hindi' ? 'शाम को खेत में हल्की नमी बनाए रखें ताकि परागकण सुरक्षित रहें।' : 'Provide light evening irrigation to reduce flower heat stress.',
        };
      }
    }

    if (crop.growthStage === 'grain_filling') {
      if (isWindy && isRainy) {
        return {
          level: 'high',
          title: language === 'Hindi' ? 'फसल गिरने (Lodging) का गंभीर खतरा' : 'Severe Lodging Risk',
          advice: language === 'Hindi' ? 'दाना भारी होने और तेज हवा/बारिश से पौधे गिर सकते हैं। जल निकासी सुनिश्चित करें।' : 'Heavy heads and strong winds can cause lodging. Ensure field drainage.',
        };
      }
    }

    if (crop.growthStage === 'maturity_harvest') {
      if (isRainy) {
        return {
          level: 'high',
          title: language === 'Hindi' ? 'कटाई रोकें - दाने में फफूंद का डर' : 'Postpone Harvest - Rain Risk',
          advice: language === 'Hindi' ? 'कटी फसल सुरक्षित गोदाम या तिरपाल में रखें।' : 'Keep harvested sheaves covered under tarpaulins.',
        };
      }
    }

    return {
      level: 'low',
      title: language === 'Hindi' ? 'मौसम फसल विकास के अनुकूल है' : 'Weather favorable for current stage',
      advice: language === 'Hindi' ? 'सामान्य देखरेख और आवश्यकतानुसार पोषक तत्व प्रबंधन करें।' : 'Maintain scheduled nutrient and moisture management.',
    };
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar with Add Field button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {t.myCrops}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            {language === 'Hindi'
              ? 'खेतों के अनुसार फसल की अवस्था व मौसम जोखिम प्रबंधन'
              : 'Track crop growth stages and weather impact per field plot'}
          </p>
        </div>

        <button
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addField}</span>
        </button>
      </div>

      {/* Add New Crop Form (Collapsible Glass Modal) */}
      {isAddingNew && (
        <form
          onSubmit={handleCreateCrop}
          className="glass-panel rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-300/60 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
            <span>🌱</span>
            <span>{language === 'Hindi' ? 'नया खेत व फसल का विवरण भरें' : 'Add New Field & Crop'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {language === 'Hindi' ? 'खेत / प्लॉट का नाम:' : 'Field / Plot Name:'}
              </label>
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="उदा. उत्तर वाला खेत (खेत 1)"
                className="w-full p-3 rounded-xl glass-input font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {language === 'Hindi' ? 'फसल चुनें:' : 'Select Crop:'}
              </label>
              <select
                value={newCropName}
                onChange={(e) => setNewCropName(e.target.value)}
                className="w-full p-3 rounded-xl glass-input font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {COMMON_CROPS.map((c) => (
                  <option key={c.nameEn} value={language === 'Hindi' ? c.nameHi : c.nameEn}>
                    {language === 'Hindi' ? c.nameHi : c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {language === 'Hindi' ? 'किस्म / वैरायटी (वैकल्पिक):' : 'Variety (Optional):'}
              </label>
              <input
                type="text"
                value={newVariety}
                onChange={(e) => setNewVariety(e.target.value)}
                placeholder="उदा. HD-2967, Sharbati, Bt"
                className="w-full p-3 rounded-xl glass-input font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {language === 'Hindi' ? 'वर्तमान फसल अवस्था:' : 'Current Growth Stage:'}
              </label>
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value as any)}
                className="w-full p-3 rounded-xl glass-input font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.icon} {language === 'Hindi' ? s.labelHi : s.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 mt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2.5 rounded-xl glass-pill hover:bg-white text-stone-700 text-xs font-bold transition-colors cursor-pointer"
            >
              {language === 'Hindi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              {language === 'Hindi' ? 'सहेजें (Save)' : 'Save Crop'}
            </button>
          </div>
        </form>
      )}

      {/* List of Saved Crop Fields with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {crops.map((crop) => {
          const isSelected = crop.id === activeCropId;
          const risk = getStageRiskAnalysis(crop);

          return (
            <div
              key={crop.id}
              onClick={() => onSelectActiveCrop(crop.id)}
              className={`p-4 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'glass-card-dark text-white ring-2 ring-emerald-400/50 shadow-lg'
                  : 'glass-panel text-stone-900 hover:border-emerald-300 shadow-xs hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    📍 {crop.fieldName}
                  </span>
                  {crops.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCrop(crop.id);
                      }}
                      className={`p-1.5 rounded-xl transition-colors ${
                        isSelected ? 'text-emerald-300 hover:text-white hover:bg-emerald-800' : 'text-stone-400 hover:text-rose-600'
                      }`}
                      title="Remove plot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="mt-3">
                  <h4 className="font-black text-lg leading-snug flex items-center gap-2">
                    <span>🌾</span>
                    <span>{crop.name}</span>
                  </h4>
                  {crop.variety && (
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-emerald-300' : 'text-stone-500'}`}>
                      {language === 'Hindi' ? 'किस्म:' : 'Variety:'} {crop.variety}
                    </p>
                  )}
                </div>

                {/* Stage Badge */}
                <div className="mt-3 flex items-center gap-1.5">
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-xl ${
                      isSelected ? 'bg-emerald-800/90 text-amber-300' : 'bg-emerald-50 text-emerald-900 border border-emerald-200/60'
                    }`}
                  >
                    {STAGES.find((s) => s.key === crop.growthStage)?.icon}{' '}
                    {language === 'Hindi'
                      ? STAGES.find((s) => s.key === crop.growthStage)?.labelHi
                      : STAGES.find((s) => s.key === crop.growthStage)?.labelEn}
                  </span>
                </div>
              </div>

              {/* Weather Alert for this stage */}
              {risk && (
                <div
                  className={`p-3 rounded-2xl text-xs ${
                    isSelected
                      ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-100'
                      : risk.level === 'high'
                      ? 'bg-rose-50 border border-rose-200 text-rose-900'
                      : 'bg-stone-50 border border-stone-200 text-stone-700'
                  }`}
                >
                  <div className="font-extrabold flex items-center gap-1.5 mb-0.5">
                    {risk.level === 'high' ? '⚠️' : '✅'}
                    <span>{risk.title}</span>
                  </div>
                  <p className="opacity-90 leading-relaxed font-medium">{risk.advice}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Stage Stepper for Active Crop */}
      {activeCrop && (
        <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-xs mt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {language === 'Hindi' ? 'सक्रिय फसल व विकास अवस्था' : 'Active Field & Growth Stage Tracker'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                {activeCrop.name} ({activeCrop.fieldName})
              </h3>
            </div>

            <button
              onClick={() =>
                onAskAiForCrop(
                  activeCrop.name,
                  STAGES.find((s) => s.key === activeCrop.growthStage)?.labelHi || 'वानस्पतिक'
                )
              }
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 self-start sm:self-auto border border-amber-200 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-stone-950" />
              <span>
                {language === 'Hindi'
                  ? `${activeCrop.name} के लिए AI सलाह लें`
                  : `Get AI Advice for ${activeCrop.name}`}
              </span>
            </button>
          </div>

          {/* Interactive Progress Steps with Frosted Glass */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {STAGES.map((s) => {
              const isActive = activeCrop.growthStage === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => onUpdateCropStage(activeCrop.id, s.key)}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/50'
                      : 'glass-panel-subtle hover:bg-white text-stone-700 border-white/75 hover:border-emerald-300/80 shadow-2xs'
                  }`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-xs font-bold leading-tight">
                    {language === 'Hindi' ? s.labelHi : s.labelEn}
                  </span>
                  {isActive && (
                    <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-black mt-1">
                      {language === 'Hindi' ? 'वर्तमान' : 'Current'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

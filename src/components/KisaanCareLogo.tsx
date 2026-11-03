import React from 'react';

interface KisaanCareLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export const KisaanCareLogo: React.FC<KisaanCareLogoProps> = ({
  size = 'md',
  showText = false,
  subtitle,
  className = '',
}) => {
  // Dimension definitions for emblem and text sizing
  const sizeMap = {
    xs: { box: 'w-7 h-7', px: 28, rounded: 'rounded-lg', text: 'text-sm', subText: 'text-[10px]' },
    sm: { box: 'w-9 h-9 sm:w-10 sm:h-10', px: 38, rounded: 'rounded-xl', text: 'text-base sm:text-lg', subText: 'text-[11px]' },
    md: { box: 'w-12 h-12', px: 48, rounded: 'rounded-2xl', text: 'text-lg sm:text-xl', subText: 'text-xs' },
    lg: { box: 'w-16 h-16', px: 64, rounded: 'rounded-2xl', text: 'text-2xl', subText: 'text-sm' },
    xl: { box: 'w-20 h-20', px: 80, rounded: 'rounded-3xl', text: 'text-3xl', subText: 'text-base' },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Minimal Icon Emblem */}
      <div
        className={`${current.box} ${current.rounded} bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-950 p-1 flex items-center justify-center shadow-md shadow-emerald-950/30 ring-1 ring-emerald-400/35 relative overflow-hidden group shrink-0 transition-transform duration-200 group-hover:scale-105`}
      >
        {/* Subtle ambient light gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/10 via-transparent to-emerald-400/20 pointer-events-none" />

        <svg
          viewBox="0 0 256 256"
          className="w-full h-full relative z-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Golden Sun Gradient */}
            <radialGradient id="kcMinSun" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fef08a" />
              <stop offset="65%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>

            {/* Left Caring Leaf Gradient */}
            <linearGradient id="kcMinLeafL" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            {/* Right Sprout Blade Gradient */}
            <linearGradient id="kcMinLeafR" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>
          </defs>

          {/* Minimal Icon: Sun / Vitality Core */}
          <circle cx="154" cy="80" r="26" fill="url(#kcMinSun)" />
          <circle cx="154" cy="80" r="32" fill="#facc15" fillOpacity="0.18" />

          {/* Minimal Icon: Caring Left Leaf (Growth & Agricultural Protection) */}
          <path
            d="M 128 212 C 82 206 54 168 54 122 C 54 74 90 42 126 28 C 112 64 114 102 126 138 C 131 154 133 182 128 212 Z"
            fill="url(#kcMinLeafL)"
          />

          {/* Minimal Icon: Rising Right Sprout (Vitality & Care) */}
          <path
            d="M 128 212 C 148 184 182 158 196 126 C 210 94 200 64 182 46 C 190 72 186 102 164 132 C 148 154 138 180 128 212 Z"
            fill="url(#kcMinLeafR)"
          />

          {/* Subtle Stem Arc */}
          <path
            d="M 128 212 C 129 180 134 150 142 126"
            stroke="#a7f3d0"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />
        </svg>
      </div>

      {/* Typography (When requested) */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-tight text-white ${current.text} font-['Outfit']`}>
              Kisaan
            </span>
            <span className={`font-black tracking-tight text-emerald-400 ${current.text} font-['Outfit']`}>
              Care
            </span>
          </div>
          {subtitle && (
            <span className={`text-emerald-200/85 font-medium mt-0.5 tracking-tight ${current.subText}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

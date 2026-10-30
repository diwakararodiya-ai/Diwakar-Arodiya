import React, { useState, useEffect } from 'react';
import { UserProfile, SupportedLanguage } from '../types';
import { User, Mail, Phone, X, Check, ArrowRight, LogOut, Edit3, ShieldCheck, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogin: (profile: UserProfile) => void;
  onLogout: () => void;
  language: SupportedLanguage;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onLogout,
  language,
}) => {
  const isHindi = language === 'Hindi';

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync state when modal opens or user changes
  useEffect(() => {
    if (user && user.isLoggedIn) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      setIsEditing(false);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setIsEditing(true);
    }
    setErrors({});
    setIsSuccess(false);
  }, [user, isOpen]);

  if (!isOpen) return null;

  // Validation helper
  const validate = () => {
    const newErrors: { name?: string; email?: string; phone?: string } = {};

    const cleanName = name.trim();
    if (!cleanName) {
      newErrors.name = isHindi ? 'कृपया अपना नाम दर्ज करें' : 'Please enter your name';
    } else if (cleanName.length < 2) {
      newErrors.name = isHindi ? 'नाम कम से कम 2 अक्षरों का होना चाहिए' : 'Name must be at least 2 characters';
    }

    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail) {
      newErrors.email = isHindi ? 'कृपया ईमेल पता दर्ज करें' : 'Please enter your email';
    } else if (!emailRegex.test(cleanEmail)) {
      newErrors.email = isHindi ? 'कृपया मान्य ईमेल दर्ज करें (उदा: kisan@example.com)' : 'Please enter a valid email address';
    }

    // Standard 10-digit phone number check (allows Indian mobile numbers)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      newErrors.phone = isHindi ? 'कृपया मोबाइल नंबर दर्ज करें' : 'Please enter your mobile number';
    } else if (cleanPhone.length < 10) {
      newErrors.phone = isHindi ? 'मोबाइल नंबर कम से कम 10 अंकों का होना चाहिए' : 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      isLoggedIn: true,
      joinedAt: user?.joinedAt || new Date().toISOString(),
    };

    setIsSuccess(true);
    setTimeout(() => {
      onLogin(profile);
      setIsSuccess(false);
      onClose();
    }, 600);
  };

  // Quick Demo Autofill
  const handleQuickDemo = () => {
    setName(isHindi ? 'राम कुमार' : 'Ram Kumar');
    setEmail('ram.kisan@example.com');
    setPhone('9876543210');
    setErrors({});
  };

  const handleLogoutClick = () => {
    onLogout();
    setName('');
    setEmail('');
    setPhone('');
    setIsEditing(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-stone-200/90 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-lg shadow-sm border border-amber-200 shrink-0">
              {user?.isLoggedIn && !isEditing ? (
                <span className="font-extrabold text-base">
                  {user.name.trim().charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-5 h-5 text-stone-950" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight text-white">
                {user?.isLoggedIn && !isEditing
                  ? isHindi
                    ? 'किसान प्रोफ़ाइल'
                    : 'Farmer Profile'
                  : isHindi
                  ? 'लॉगिन करें'
                  : 'Minimal Sign In'}
              </h3>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                {user?.isLoggedIn && !isEditing
                  ? isHindi
                    ? 'आपकी व्यक्तिगत जानकारी'
                    : 'Your verified account details'
                  : isHindi
                  ? 'नाम, ईमेल और नंबर दर्ज करें'
                  : 'Enter name, email & phone number'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6">
          {/* VIEW MODE: If already logged in and not editing */}
          {user?.isLoggedIn && !isEditing ? (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/70">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    {isHindi ? 'खाता विवरण' : 'Account Details'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    {isHindi ? 'सक्रिय खाता' : 'Active'}
                  </span>
                </div>

                {/* Name */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-stone-500 font-medium">{isHindi ? 'पूरा नाम' : 'Full Name'}</p>
                    <p className="text-sm font-bold text-stone-900 truncate">{user.name}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-stone-500 font-medium">{isHindi ? 'ईमेल पता' : 'Email'}</p>
                    <p className="text-sm font-bold text-stone-900 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-stone-500 font-medium">{isHindi ? 'मोबाइल नंबर' : 'Phone'}</p>
                    <p className="text-sm font-bold text-stone-900 truncate font-mono">{user.phone}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isHindi ? 'जानकारी बदलें' : 'Edit Details'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="py-2.5 px-3.5 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200 hover:border-rose-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title={isHindi ? 'लॉगआउट करें' : 'Sign out'}
                >
                  <LogOut className="w-4 h-4 text-stone-500 hover:text-rose-600" />
                  <span>{isHindi ? 'लॉगआउट' : 'Log Out'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* FORM MODE: Login or Edit details */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isHindi ? 'पूरा नाम' : 'Full Name'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder={isHindi ? 'उदा: राम कुमार शर्मा' : 'e.g. Ram Kumar Sharma'}
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 border transition-all text-stone-900 focus:bg-white focus:outline-none ${
                      errors.name
                        ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-200'
                        : 'border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Field 2: Email */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isHindi ? 'ईमेल पता' : 'Email Address'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder={isHindi ? 'उदा: kisan@example.com' : 'e.g. farmer@example.com'}
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 border transition-all text-stone-900 focus:bg-white focus:outline-none ${
                      errors.email
                        ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-200'
                        : 'border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Field 3: Phone Number */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isHindi ? 'मोबाइल नंबर' : 'Phone Number'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex">
                  {/* Country Prefix Pill */}
                  <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-stone-200 bg-stone-100 text-stone-600 font-mono text-xs font-semibold">
                    +91
                  </span>
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                        setPhone(val);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`w-full pl-3 pr-3.5 py-2.5 text-xs sm:text-sm rounded-r-xl bg-stone-50 border font-mono transition-all text-stone-900 focus:bg-white focus:outline-none ${
                        errors.phone
                          ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-200'
                          : 'border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                      }`}
                    />
                  </div>
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.phone}</p>
                )}
              </div>

              {/* Quick Demo Autofill helper */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200/80 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{isHindi ? 'डेमो विवरण भरें' : 'Quick Demo Fill'}</span>
                </button>

                {user?.isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    {isHindi ? 'रद्द करें' : 'Cancel'}
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isSuccess}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-80"
                >
                  {isSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200 animate-bounce" />
                      <span>{isHindi ? 'लॉगिन हो रहा है...' : 'Signing in...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{user?.isLoggedIn ? (isHindi ? 'अपडेट करें' : 'Save Changes') : (isHindi ? 'लॉगिन करें' : 'Continue')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Skip for now option (when first entering) */}
                {!user?.isLoggedIn && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2 text-center text-xs text-stone-500 hover:text-stone-800 font-medium transition-colors cursor-pointer"
                  >
                    {isHindi ? 'बाद में करें (स्किप)' : 'Skip for now'}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  ChatMessage,
  CurrentWeather,
  DailyItem,
  HourlyItem,
  LocationItem,
  CropProfile,
  SupportedLanguage,
  UserProfile,
} from '../types';
import { TRANSLATIONS, LANGUAGE_METADATA } from '../translations';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface AIAssistantProps {
  currentLocation: LocationItem;
  currentWeather: CurrentWeather | null;
  hourly: HourlyItem[];
  daily: DailyItem[];
  activeCrop: CropProfile | null;
  onUpdateCrop: (updated: Partial<CropProfile>) => void;
  language: SupportedLanguage;
  user?: UserProfile | null;
  quickPrompt?: string | null;
  onClearQuickPrompt?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  currentLocation,
  currentWeather,
  hourly,
  daily,
  activeCrop,
  onUpdateCrop,
  language,
  user,
  quickPrompt,
  onClearQuickPrompt,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.Hindi;
  const langMeta = LANGUAGE_METADATA[language] || LANGUAGE_METADATA.Hindi;
  const isHindi = language === 'Hindi';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoVoiceOutput, setAutoVoiceOutput] = useState(true);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isPlayingAudio]);

  // Initial Welcome greeting
  useEffect(() => {
    if (messages.length === 0 && currentWeather) {
      const userName = user?.name ? (isHindi ? `${user.name} जी` : user.name) : (isHindi ? 'किसान भाई' : 'farmer');
      const greetingText = isHindi
        ? `राम-राम ${userName}! 🙏 मैं आपका किसान मौसम मित्र हूँ।\n\n${currentLocation.name} में अभी तापमान ${currentWeather.temp}°C और बारिश की संभावना ${currentWeather.rainProbability}% है।\n\nमाइक दबाकर बोलें या लिखकर पूछें — सिंचाई, कीटनाशक छिड़काव या फसल सुरक्षा की क्या सलाह चाहिए?`
        : `Hello ${userName}! 🙏 I am your Kisan AI Weather Mitra.\n\nIn ${currentLocation.name}, temperature is ${currentWeather.temp}°C with ${currentWeather.rainProbability}% rain chance.\n\nTap the mic to speak or type your question about irrigation, spraying, or crop care.`;

      const initialSuggestions = isHindi
        ? [
            'क्या आज सिंचाई करें?',
            'दवा का छिड़काव कब करें?',
            'अगले 7 दिन मौसम कैसा रहेगा?',
            'फसल सुरक्षा के उपाय बताएं',
          ]
        : [
            'Should I irrigate today?',
            'Is it safe to spray pesticides?',
            '7-day weather outlook',
            'Crop safety precautions',
          ];

      setMessages([
        {
          id: 'welcome_1',
          role: 'assistant',
          content: greetingText,
          audioText: greetingText.replace(/[*#]/g, ''),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          followUpQuestions: initialSuggestions,
          agriculturalActionType: 'general',
        },
      ]);
      setSuggestedQuestions(initialSuggestions);
    }
  }, [currentLocation, currentWeather, language, isHindi, user]);

  useEffect(() => {
    if (quickPrompt) {
      handleSendMessage(quickPrompt);
      if (onClearQuickPrompt) onClearQuickPrompt();
    }
  }, [quickPrompt]);

  // Speech Recognition (Speech-to-Text)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = langMeta.bcp47;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(
            isHindi ? 'कृपया माइक की अनुमति दें।' : 'Microphone permission denied.'
          );
        } else if (event.error !== 'no-speech') {
          setSpeechError(
            isHindi ? 'आवाज़ साफ़ नहीं आई, पुनः बोलें।' : 'Could not catch voice. Try again.'
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language, langMeta.bcp47, isHindi]);

  // Toggle voice recording
  const toggleListening = () => {
    if (isPlayingAudio) {
      stopAudio();
    }

    if (isListening) {
      recognitionRef.current?.stop();
      if (inputText.trim()) {
        handleSendMessage(inputText);
      }
    } else {
      setSpeechError(null);
      setInputText('');
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Mic start error:', err);
      }
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  // Play spoken response
  const playAudio = async (textToSpeak: string) => {
    if (isPlayingAudio) {
      stopAudio();
      return;
    }

    setIsPlayingAudio(true);

    try {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak, language }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audio.onended = () => {
            setIsPlayingAudio(false);
            setCurrentAudio(null);
          };
          audio.onerror = () => {
            fallbackSpeechSynthesis(textToSpeak);
          };
          setCurrentAudio(audio);
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn('Server TTS fallback:', e);
    }

    fallbackSpeechSynthesis(textToSpeak);
  };

  const fallbackSpeechSynthesis = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langMeta.bcp47;
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        (v) => v.lang === langMeta.bcp47 || v.lang.startsWith(langMeta.bcp47.split('-')[0])
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    stopAudio();
    setInputText('');

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const forecastSummary = {
        hourlyBrief: hourly.slice(0, 12).map((h) => ({
          time: h.hourDisplay,
          temp: h.temp,
          rainProb: h.rainProbability,
          wind: h.windSpeed,
        })),
        dailyBrief: daily.slice(0, 5).map((d) => ({
          day: d.dayDisplay,
          max: d.tempMax,
          min: d.tempMin,
          rainMm: d.rainMm,
          rainProb: d.rainProbability,
        })),
      };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: query,
          conversationHistory: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          language,
          locationInfo: {
            name: currentLocation.name,
            district: currentLocation.district,
            state: currentLocation.state,
          },
          currentWeather: currentWeather
            ? {
                temp: currentWeather.temp,
                feelsLike: currentWeather.feelsLike,
                humidity: currentWeather.humidity,
                windSpeed: currentWeather.windSpeed,
                rainProbability: currentWeather.rainProbability,
                rainMm: currentWeather.rainMm,
                condition: currentWeather.condition,
                alert: currentWeather.alert,
              }
            : {},
          forecastSummary,
          cropProfile: activeCrop
            ? {
                name: activeCrop.name,
                variety: activeCrop.variety,
                growthStage: activeCrop.growthStage,
                irrigationType: activeCrop.irrigationType,
                soilType: activeCrop.soilType,
              }
            : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI request failed with status ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'सलाह प्राप्त नहीं हो सकी।',
        audioText: data.audioText || data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        followUpQuestions: data.followUpQuestions || [],
        agriculturalActionType: data.agriculturalActionType || 'general',
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.followUpQuestions && data.followUpQuestions.length > 0) {
        setSuggestedQuestions(data.followUpQuestions);
      }

      if (data.detectedCropStage && activeCrop) {
        onUpdateCrop({ notes: `Stage detected: ${data.detectedCropStage}` });
      }

      // Auto play audio if enabled
      if (autoVoiceOutput) {
        setTimeout(() => {
          playAudio(data.audioText || data.reply);
        }, 200);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: isHindi
          ? 'मौसम सर्वर से संपर्क हो रहा है। कृपया पुनः प्रश्न पूछें।'
          : 'Connecting to weather server. Please ask your question again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        followUpQuestions: [
          isHindi ? 'क्या आज सिंचाई करें?' : 'Should I irrigate today?',
          isHindi ? 'दवा का छिड़काव कब करें?' : 'When to spray pesticide?',
        ],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] max-h-[82vh] bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Clean, Streamlined Header */}
      <div className="px-4 py-3 bg-stone-900 text-white flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base text-white">
              {isHindi ? 'किसान मौसम मित्र' : 'Kisan Weather Mitra'}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200">
              {langMeta.nativeName}
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">
            {user?.isLoggedIn && user?.name ? `${user.name} • ` : ''}{currentLocation.name} • {currentWeather?.temp ?? '--'}°C
            {activeCrop ? ` • ${activeCrop.name}` : ''}
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          {/* Voice Auto-Speak Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isPlayingAudio) stopAudio();
              setAutoVoiceOutput((prev) => !prev);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              autoVoiceOutput
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                : 'bg-stone-800 text-stone-400 border-stone-700'
            }`}
            title={
              autoVoiceOutput
                ? isHindi
                  ? 'उत्तर स्वतः बोलें: चालू'
                  : 'Auto-voice answer: ON'
                : isHindi
                ? 'उत्तर स्वतः बोलें: बंद'
                : 'Auto-voice answer: OFF'
            }
          >
            {autoVoiceOutput ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{isHindi ? 'बोलकर उत्तर' : 'Voice'}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                <span className="hidden sm:inline">{isHindi ? 'म्यूट' : 'Muted'}</span>
              </>
            )}
          </button>

          {/* Reset Conversation */}
          <button
            type="button"
            onClick={() => {
              stopAudio();
              setMessages([]);
            }}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
            title={isHindi ? 'नई चैट' : 'Reset'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Clutter-Free Message History */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-stone-50/60">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-2xs ${
                  isUser
                    ? 'bg-emerald-700 text-white rounded-br-xs font-normal'
                    : 'bg-white text-stone-900 border border-stone-200/90 rounded-bl-xs'
                }`}
              >
                {/* Content */}
                <div>{msg.content}</div>

                {/* Footer with Timestamp and Listen button */}
                <div
                  className={`mt-1.5 pt-1.5 flex items-center justify-between gap-3 text-[10px] ${
                    isUser
                      ? 'border-t border-white/20 text-emerald-100'
                      : 'border-t border-stone-100 text-stone-500'
                  }`}
                >
                  <span className="font-mono">{msg.timestamp}</span>

                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => playAudio(msg.audioText || msg.content)}
                      className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-900 cursor-pointer transition-colors"
                      title={isHindi ? 'आवाज़ में सुनें' : 'Listen audio'}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'सुनें' : 'Listen'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-stone-200 text-stone-600 text-xs w-fit shadow-2xs">
            <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span>{isHindi ? 'सलाह तैयार हो रही है...' : 'Thinking...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions (Simple soft chips) */}
      {suggestedQuestions.length > 0 && (
        <div className="px-3 py-1.5 bg-white border-t border-stone-100 shrink-0">
          <div className="flex gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="shrink-0 text-xs font-normal bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 px-3 py-1 rounded-full border border-stone-200 hover:border-emerald-300 transition-colors whitespace-nowrap active:scale-95 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Speech Error Banner */}
      {speechError && (
        <div className="px-3 py-1 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs flex items-center justify-between shrink-0">
          <span>{speechError}</span>
          <button
            type="button"
            onClick={() => setSpeechError(null)}
            className="font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Clutter-Free Input Area with Prominent Mic Button */}
      <div className="p-2.5 sm:p-3 bg-white border-t border-stone-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Prominent Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-sm active:scale-95 ${
              isListening
                ? 'bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
            title={
              isListening
                ? isHindi
                  ? 'सुन रहा हूँ... रोकने के लिए दबाएं'
                  : 'Listening... Tap to stop'
                : isHindi
                ? 'माइक दबाकर बोलें'
                : 'Tap to speak'
            }
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>

          {/* Clean Input Field */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? isHindi
                  ? 'बोलिए... आपकी आवाज़ दर्ज हो रही है'
                  : 'Listening... speak now'
                : isHindi
                ? 'माइक दबाकर बोलें या यहाँ लिखें...'
                : 'Tap mic to speak or type here...'
            }
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 focus:outline-none text-stone-900 transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 text-white disabled:text-stone-400 flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:cursor-not-allowed"
            title={isHindi ? 'भेजें' : 'Send'}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

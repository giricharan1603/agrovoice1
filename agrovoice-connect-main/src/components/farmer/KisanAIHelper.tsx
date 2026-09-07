import React, { useState, useEffect } from "react";
import { Mic, Send, Sparkles, AlertCircle, Camera, CheckCircle2, IndianRupee, Globe, Volume2, ArrowRight, Key, Settings, Check, Zap, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useVoiceRecognition, LANGUAGE_OPTIONS, SupportedLanguage } from "@/hooks/use-voice-recognition";
import { askAgroVoiceAI, analyzeCropDiseaseVision, getStoredAiKey, saveAiKey } from "@/lib/ai-service";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  language?: string;
}

export function KisanAIHelper() {
  const { isListening, transcript, startListening, stopListening, setTranscript } = useVoiceRecognition();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("hi-IN");

  // AI API Key configuration state
  const [apiKey, setApiKeyState] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);

  useEffect(() => {
    setApiKeyState(getStoredAiKey());
  }, []);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveAiKey(apiKey);
    setShowKeyModal(false);
    toast.success("Google Gemini API Key saved successfully!");
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "ai",
      text: "Namaste Farmer Brother! I am Kisan AI powered by Google Gemini. Select your language above and ask any question live about crops, Mandi prices (in ₹/kg), disease cures, or shared freight.",
      timestamp: "Just now",
      language: "en-IN",
    },
  ]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "disease" | "calculator">("chat");
  const [isThinking, setIsThinking] = useState(false);

  // Image Upload & Crop Type State for Plant Scanner
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCropCategory, setSelectedCropCategory] = useState("Auto-Detect Plant");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);

  // Freight calculator state
  const [calcQuantity, setCalcQuantity] = useState(4000);
  const [calcDistance, setCalcDistance] = useState(85);

  const handleLanguageSwitch = (newLang: SupportedLanguage) => {
    setSelectedLanguage(newLang);
    const langObj = LANGUAGE_OPTIONS.find((l) => l.code === newLang);
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: "ai",
        text: `🌐 Language switched to ${langObj?.name} (${langObj?.native}).\nAsk Kisan AI anything in your language!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: newLang,
      },
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input || transcript;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      language: selectedLanguage,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTranscript("");
    setIsThinking(true);

    try {
      const aiReplyText = await askAgroVoiceAI(text, selectedLanguage);

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: "ai",
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: selectedLanguage,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      toast.error("Failed to connect to AI server");
    } finally {
      setIsThinking(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setSelectedImage(base64Data);
        setIsAnalyzing(true);
        setDiagnosisResult(null);

        try {
          const result = await analyzeCropDiseaseVision(base64Data);
          setDiagnosisResult(result);
          toast.success(`Identified: ${result.crop} - ${result.diseaseName}`);
        } catch (err) {
          toast.error("Vision analysis error");
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card shadow-2xl overflow-hidden">
      {/* AI Assistant Top Navigation */}
      <div className="flex border-b border-border bg-muted/40 p-2.5 gap-2 overflow-x-auto items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition-all ${
              activeTab === "chat"
                ? "bg-brand-gradient text-brand-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            AgroVoice Kisan AI
          </button>

          <button
            onClick={() => setActiveTab("disease")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition-all ${
              activeTab === "disease"
                ? "bg-brand-gradient text-brand-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Camera className="h-4 w-4" />
            AI Crop Leaf Scanner
          </button>

          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition-all ${
              activeTab === "calculator"
                ? "bg-brand-gradient text-brand-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <IndianRupee className="h-4 w-4" />
            Freight Savings AI Calculator
          </button>
        </div>

        {/* Gemini API Key Modal Button */}
        <button
          onClick={() => setShowKeyModal(true)}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all shrink-0 border ${
            apiKey
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-600 border-amber-500/30"
          }`}
        >
          <Key className="h-3.5 w-3.5" />
          {apiKey ? "⚡ Gemini Key Active" : "🔑 Set Gemini API Key"}
        </button>
      </div>

      {/* Language Selector Toolbar */}
      {activeTab === "chat" && (
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <Globe className="h-4 w-4 text-brand" />
            <span className="text-xs font-bold text-foreground">AI Language:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageSwitch(lang.code)}
                className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                  selectedLanguage === lang.code
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.native}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 1: Live Kisan AI Chat Assistant */}
      {activeTab === "chat" && (
        <div className="flex flex-col h-[520px]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${
                  m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-bold ${
                    m.sender === "user"
                      ? "bg-amber-600 text-white shadow-md"
                      : "bg-gradient-to-br from-blue-600 to-emerald-600 text-white shadow-md"
                  }`}
                >
                  {m.sender === "user" ? "You" : "✨"}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    m.sender === "user"
                      ? "bg-amber-600 text-white rounded-tr-none"
                      : "bg-card border border-border text-foreground rounded-tl-none"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`mt-1.5 block text-[10px] ${
                      m.sender === "user" ? "text-amber-100" : "text-muted-foreground"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2.5 text-xs font-black text-blue-600 dark:text-blue-400 animate-pulse bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 max-w-xs">
                <Zap className="h-4 w-4 animate-spin text-blue-600" />
                <span>Kisan AI is analyzing your question...</span>
              </div>
            )}
          </div>

          {/* Quick Preset Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto p-2 bg-muted/20 border-t border-border">
            <button
              onClick={() => handleSend("What are today's potato and onion mandi prices in Agra and Delhi in ₹/kg?")}
              className="shrink-0 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:bg-brand-muted hover:text-brand transition-all"
            >
              🥔 Mandi Rates (₹/kg)
            </button>
            <button
              onClick={() => handleSend("What are the treatment steps for yellow leaf spots on tomato crops?")}
              className="shrink-0 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:bg-brand-muted hover:text-brand transition-all"
            >
              🌿 Leaf Spot Remedy
            </button>
            <button
              onClick={() => handleSend("How can shared truck load booking save freight costs for farmers?")}
              className="shrink-0 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:bg-brand-muted hover:text-brand transition-all"
            >
              🚚 Freight Savings Guide
            </button>
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-border bg-card flex items-center gap-2">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
                isListening
                  ? "bg-red-500 text-white animate-pulse shadow-lg"
                  : "bg-brand-gradient text-brand-foreground hover:scale-105"
              }`}
              title="Voice Mic Input"
            >
              <Mic className="h-5 w-5" />
            </button>

            <input
              type="text"
              value={input || transcript}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "Listening... बोलिए..." : "Ask Kisan AI any question live in " + LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.name + "..."}
              className="flex-1 rounded-2xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40 font-medium"
            />

            <button
              onClick={() => handleSend()}
              disabled={isThinking}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-brand-foreground hover:opacity-90 transition-all shadow-md"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Accurate Plant-Aware Crop Pest & Disease Diagnostic */}
      {activeTab === "disease" && (
        <div className="p-6 space-y-6">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-xl font-bold text-foreground">AI Plant Disease Scanner</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Upload or snap a photo of damaged crop leaves for exact plant species identification and disease diagnosis.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl p-8 bg-muted/10 text-center relative hover:bg-muted/20 transition-all">
            {selectedImage ? (
              <div className="relative">
                <img src={selectedImage} alt="Crop leaf sample" className="max-h-60 rounded-2xl object-cover shadow-lg" />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setDiagnosisResult(null);
                  }}
                  className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
                >
                  <AlertCircle className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-brand-muted flex items-center justify-center text-brand mb-3 shadow-md">
                  <Camera className="h-8 w-8" />
                </div>
                <span className="text-sm font-bold text-foreground">Click to Upload Crop Leaf Image</span>
                <span className="text-xs text-muted-foreground mt-1">Supports Tomato, Paddy, Potato, Chilli, Wheat, Cotton, Grapes</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          {isAnalyzing && (
            <div className="text-center py-4 space-y-2">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
              <p className="text-xs font-bold text-emerald-600 animate-pulse">Analyzing leaf features & identifying exact plant species...</p>
            </div>
          )}

          {diagnosisResult && (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Accurate Plant Species Identified ({diagnosisResult.confidence})</span>
                </div>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600">
                  {diagnosisResult.severity} Severity
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Identified Plant / Crop</span>
                  <p className="font-black text-foreground text-base mt-0.5 text-brand">{diagnosisResult.crop}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Diagnosed Disease Condition</span>
                  <p className="font-black text-foreground text-sm mt-0.5">{diagnosisResult.diseaseName}</p>
                </div>
              </div>

              <div className="border-t border-emerald-500/20 pt-3 space-y-2">
                <span className="text-xs font-bold text-foreground block">Recommended Treatment & Spray Dosage:</span>
                <p className="text-xs text-muted-foreground bg-card p-4 rounded-2xl border border-border leading-relaxed font-medium">
                  {diagnosisResult.recommendedTreatment}
                </p>
                {diagnosisResult.preventionTips && (
                  <p className="text-xs text-muted-foreground bg-card/60 p-3 rounded-xl border border-border">
                    💡 <b>Field Prevention Tips:</b> {diagnosisResult.preventionTips}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Freight Savings Calculator */}
      {activeTab === "calculator" && (
        <div className="p-6 space-y-6">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-xl font-bold text-foreground">Load Sharing Freight Cost Calculator</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Compare exclusive full truck booking vs AgroVoice shared truck space to calculate exact savings in kg.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div>
                <label className="text-xs font-bold text-foreground">Shipment Load (Kilograms - kg)</label>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="250"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(parseInt(e.target.value))}
                  className="w-full accent-brand mt-3"
                />
                <span className="text-sm font-black text-brand block text-right mt-1">{calcQuantity} kg total weight</span>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Transport Distance (km)</label>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="10"
                  value={calcDistance}
                  onChange={(e) => setCalcDistance(parseInt(e.target.value))}
                  className="w-full accent-brand mt-3"
                />
                <span className="text-sm font-black text-brand block text-right mt-1">{calcDistance} km</span>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between space-y-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Full Truck Exclusive Fare</span>
                  <span className="line-through text-red-500 font-bold text-sm">₹{Math.round(calcDistance * 45 + 1500)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">AgroVoice Shared Fare</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg">
                    ₹{Math.round(calcQuantity * 0.4)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-brand-muted p-5 text-center shadow-inner">
                <span className="text-xs text-brand font-bold block">Net Freight Savings for Farmer</span>
                <span className="text-3xl font-black text-brand">
                  ₹{Math.round(calcDistance * 45 + 1500 - calcQuantity * 0.4)}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-1">Saves up to 48% on logistics expenses</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gemini API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleSaveKey} className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-foreground">Configure Google Gemini API Key</h3>
              </div>
              <button type="button" onClick={() => setShowKeyModal(false)} className="text-xs text-muted-foreground hover:text-foreground">
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Enter your Google Gemini API Key (starts with <code className="text-brand font-bold">AIza...</code>). Your key connects live to Google Gemini REST endpoints.
            </p>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Google Gemini API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 py-3 text-xs font-black text-white shadow-md hover:opacity-95 transition-all"
            >
              Save Key & Activate Live Gemini AI
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

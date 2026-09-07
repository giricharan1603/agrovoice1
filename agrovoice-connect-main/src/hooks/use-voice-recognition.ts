import { useState, useEffect, useRef, useCallback } from "react";
import { runBhashiniTwoStepPipeline, BhashiniTwoStepResult } from "@/lib/bhashini-llm-pipeline";

export interface ParsedVoiceShipment {
  produce_type: string;
  quantity_kg: number;
  quantity_quintal: number;
  pickup_village: string;
  destination_mandi: string;
  preferred_date: string;
  contact_phone: string;
  estimated_cost: number;
  confidence_score: number;
  raw_transcript?: string;
  translated_text?: string;
}

export type SupportedLanguage = "hi-IN" | "en-IN" | "ta-IN" | "te-IN" | "mr-IN" | "kn-IN" | "pa-IN" | "gu-IN";

export const LANGUAGE_OPTIONS: { code: SupportedLanguage; name: string; native: string; flag: string }[] = [
  { code: "hi-IN", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "en-IN", name: "English", native: "English", flag: "🇬🇧" },
  { code: "ta-IN", name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "te-IN", name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "mr-IN", name: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "pa-IN", name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "gu-IN", name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
];

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("hi-IN");
  const [hasSupport, setHasSupport] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessingPipeline, setIsProcessingPipeline] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<BhashiniTwoStepResult | null>(null);

  const recognitionRef = useRef<any>(null);
  const animIntervalRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSupport(false);
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback simulated Indic voice input
      setIsListening(true);
      setTranscript("");
      setInterimTranscript("Listening in " + (LANGUAGE_OPTIONS.find(l => l.code === language)?.name || "Hindi") + "...");

      animIntervalRef.current = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 85) + 15);
      }, 120);

      setTimeout(() => {
        clearInterval(animIntervalRef.current);
        setAudioLevel(0);
        setIsListening(false);
        if (language === "en-IN") {
          setTranscript("I have 50 quintals of potatoes to send to Agra Mandi on 5th September");
        } else if (language === "ta-IN") {
          setTranscript("சேலத்திலிருந்து கோயம்புத்தூர் சந்தைக்கு 50 குவிண்டால் தக்காளி அனுப்ப வேண்டும்");
        } else if (language === "te-IN") {
          setTranscript("ఖమ్మం నుండి గుంటూరు మార్కెట్‌కు 40 క్వింటాళ్ల మిరపకాయలు పంపాలి");
        } else if (language === "mr-IN") {
          setTranscript("मला ५० क्विंटल कांदा पिंपळगाव नाशिक मंडीला पाठवायचा आहे");
        } else if (language === "kn-IN") {
          setTranscript("ನನಗೆ 35 ಕ್ವಿಂಟಾಲ್ ಈರುಳ್ಳಿ ಕೋಲಾರ ಮಂಡಿಗೆ ಕಳುಹಿಸಬೇಕು");
        } else {
          setTranscript("मेरा 50 क्विंटल आलू है, हाथरस से आगरा मंडी भेजना है, 5 सितंबर को");
        }
        setInterimTranscript("");
      }, 3000);
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
        setInterimTranscript("");
        animIntervalRef.current = setInterval(() => {
          setAudioLevel(Math.floor(Math.random() * 75) + 25);
        }, 100);
      };

      recognition.onresult = (event: any) => {
        let finalStr = "";
        let interimStr = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript;
          } else {
            interimStr += item[0].transcript;
          }
        }

        if (finalStr) {
          setTranscript((prev) => (prev ? prev + " " + finalStr : finalStr));
        }
        setInterimTranscript(interimStr);
      };

      recognition.onerror = () => {
        setIsListening(false);
        clearInterval(animIntervalRef.current);
        setAudioLevel(0);
      };

      recognition.onend = () => {
        setIsListening(false);
        clearInterval(animIntervalRef.current);
        setAudioLevel(0);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
    }
    setIsListening(false);
    setAudioLevel(0);
  }, []);

  /**
   * Two-Step Pipeline Execution: Bhashini ASR (Step 1) + LLM Extraction (Step 2)
   */
  const processBhashiniPipeline = async (spokenText?: string): Promise<ParsedVoiceShipment> => {
    const textToProcess = spokenText || transcript || "मेरा 50 क्विंटल आलू है, हाथरस से आगरा मंडी भेजना है।";
    setIsProcessingPipeline(true);
    try {
      const pipelineRes = await runBhashiniTwoStepPipeline({
        textTranscript: textToProcess,
        language,
      });

      setPipelineResult(pipelineRes);
      return {
        ...pipelineRes.step2_extracted_shipment,
        raw_transcript: pipelineRes.step1_raw_transcription,
        translated_text: pipelineRes.step1_translated_english,
      };
    } finally {
      setIsProcessingPipeline(false);
    }
  };

  const parseShipmentFromVoice = (text: string): ParsedVoiceShipment => {
    const lower = text.toLowerCase();

    let produce = "Potato (आलू)";
    if (lower.includes("प्याज") || lower.includes("onion") || lower.includes("कांदा") || lower.includes("வெங்காயம்")) produce = "Onion (प्याज)";
    else if (lower.includes("टमाटर") || lower.includes("tomato") || lower.includes("தக்காளி")) produce = "Tomato (टमाटर)";
    else if (lower.includes("गेहूं") || lower.includes("wheat") || lower.includes("கோதுமை")) produce = "Wheat (गेहूं)";
    else if (lower.includes("चावल") || lower.includes("rice") || lower.includes("धान") || lower.includes("அரிசி")) produce = "Paddy / Rice (धान)";
    else if (lower.includes("मिर्च") || lower.includes("chilli") || lower.includes("mirchi")) produce = "Green Chilli (हरी मिर्च)";
    else if (lower.includes("कपास") || lower.includes("cotton")) produce = "Cotton (कपास)";

    let quintals = 50;
    const matchQuintal = text.match(/(\d+)\s*(क्विंटल|quintal|qnt|क्विण्टल|குவிண்டால்|క్వింటా|ಕ್ವಿಂಟಾಲ್)/i);
    const matchKg = text.match(/(\d+)\s*(किलो|kg|kilo|किलोग्राम|கிலோ|కిలో)/i);

    if (matchQuintal) {
      quintals = parseInt(matchQuintal[1], 10);
    } else if (matchKg) {
      quintals = Math.ceil(parseInt(matchKg[1], 10) / 100);
    }

    let mandi = "Agra Central Mandi";
    if (lower.includes("आजादपुर") || lower.includes("azadpur") || lower.includes("दिल्ली") || lower.includes("delhi")) mandi = "Azadpur Mandi, Delhi";
    else if (lower.includes("वाशी") || lower.includes("vashi") || lower.includes("मुंबई") || lower.includes("mumbai")) mandi = "Vashi APMC Mandi, Mumbai";
    else if (lower.includes("गुंटूर") || lower.includes("guntur")) mandi = "Guntur Mirchi Yard";
    else if (lower.includes("नासिक") || lower.includes("nashik") || lower.includes("लासलगांव")) mandi = "Lasalgaon Mandi, Nashik";
    else if (lower.includes("कोयம்புத்தூர்") || lower.includes("coimbatore")) mandi = "Coimbatore Central Market";

    let village = "Hathras Hub, UP";
    if (lower.includes("रामपुर") || lower.includes("rampur")) village = "Rampur Hub";
    else if (lower.includes("खुर्जा") || lower.includes("khurja")) village = "Khurja Sector 2";
    else if (lower.includes("पिंपळगाव") || lower.includes("pimpalgaon")) village = "Pimpalgaon Village, Nashik";

    return {
      produce_type: produce,
      quantity_quintal: quintals,
      quantity_kg: quintals * 100,
      pickup_village: village,
      destination_mandi: mandi,
      preferred_date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      contact_phone: "+91 98765 43210",
      estimated_cost: Math.round(quintals * 40),
      confidence_score: 0.98,
      raw_transcript: text,
    };
  };

  return {
    isListening,
    transcript,
    interimTranscript,
    language,
    setLanguage,
    hasSupport,
    audioLevel,
    isProcessingPipeline,
    pipelineResult,
    startListening,
    stopListening,
    setTranscript,
    processBhashiniPipeline,
    parseShipmentFromVoice,
  };
}

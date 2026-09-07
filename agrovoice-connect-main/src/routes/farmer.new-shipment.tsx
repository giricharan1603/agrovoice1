import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Square, Sparkles, Globe, RefreshCw, CheckCircle2, FileText, ArrowRight, Package, MapPin, Calendar, Phone, Navigation, Locate, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/AppShell";
import { farmerSidebar, farmerBottomNav } from "@/components/layout/nav-config";
import { useVoiceRecognition, LANGUAGE_OPTIONS, ParsedVoiceShipment } from "@/hooks/use-voice-recognition";
import { useAuth } from "@/lib/auth-context";
import { PureGoogleMap } from "@/components/common/PureGoogleMap";
import { LocationAutocompleteInput } from "@/components/common/LocationAutocompleteInput";

export const Route = createFileRoute("/farmer/new-shipment")({
  head: () => ({
    meta: [{ title: "New Crop Shipment — AgroVoice Google Maps" }],
  }),
  component: NewShipmentPage,
});

export function NewShipmentPage() {
  const navigate = useNavigate();
  const { user, addShipment } = useAuth();

  // Mode Switcher: 'voice' | 'manual'
  const [entryMode, setEntryMode] = useState<"voice" | "manual">("manual");

  // GPS Geolocation State
  const [isLocating, setIsLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  // Voice AI State
  const {
    isListening,
    transcript,
    interimTranscript,
    language,
    setLanguage,
    audioLevel,
    isProcessingPipeline,
    pipelineResult,
    startListening,
    stopListening,
    processBhashiniPipeline,
  } = useVoiceRecognition();

  const [extracted, setExtracted] = useState<ParsedVoiceShipment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Manual Form State
  const [manualProduce, setManualProduce] = useState("Potato (आलू)");
  const [manualKg, setManualKg] = useState(4000);
  const [manualPickup, setManualPickup] = useState("Rampur Village");
  const [manualMandi, setManualMandi] = useState("Agra Central Mandi");
  const [manualDate, setManualDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]);
  const [manualPhone, setManualPhone] = useState(user?.phone || "+91 98765 43210");
  const [manualNotes, setManualNotes] = useState("Fresh harvest, needs morning truck pickup.");

  // Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        setUserCoords([latitude, longitude]);
        const detectedName = "My Farm Location (GPS)";
        setManualPickup(detectedName);
        toast.success("Live GPS coordinates detected!");
      },
      (error) => {
        setIsLocating(false);
        toast.error("Could not fetch GPS location. Please check browser permissions.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleProcessVoice = async () => {
    const textToParse = transcript || "मेरा 50 क्विंटल आलू है, हाथरस से आगरा मंडी भेजना है 5 सितंबर को";
    const result = await processBhashiniPipeline(textToParse);
    setExtracted(result);
    toast.success("Bhashini ASR + Gemini LLM extracted shipment fields!");
  };

  const handleConfirmVoiceShipment = () => {
    if (!extracted) return;
    setSubmitting(true);

    addShipment({
      farmerName: user?.name || "Farmer",
      farmerPhone: user?.phone || "+91 98765 43210",
      produceType: extracted.produce_type,
      quantityKg: extracted.quantity_kg,
      pickupLocation: extracted.pickup_village,
      destinationMandi: extracted.destination_mandi,
      preferredDate: extracted.preferred_date,
      estimatedCost: extracted.estimated_cost,
    });

    toast.success(`Shipment of ${extracted.quantity_kg} kg ${extracted.produce_type} posted!`);
    setTimeout(() => {
      setSubmitting(false);
      navigate({ to: "/farmer/dashboard" });
    }, 700);
  };

  const handleManualFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const cost = Math.round(manualKg * 0.4);

    addShipment({
      farmerName: user?.name || "Farmer",
      farmerPhone: manualPhone,
      produceType: manualProduce,
      quantityKg: manualKg,
      pickupLocation: manualPickup,
      destinationMandi: manualMandi,
      preferredDate: manualDate,
      estimatedCost: cost,
    });

    toast.success(`Shipment of ${manualKg} kg ${manualProduce} posted successfully!`);
    setTimeout(() => {
      setSubmitting(false);
      navigate({ to: "/farmer/dashboard" });
    }, 700);
  };

  const currentPickup = entryMode === "manual" ? manualPickup : (extracted?.pickup_village || "Aligarh Central Hub");
  const currentMandi = entryMode === "manual" ? manualMandi : (extracted?.destination_mandi || "Agra Central Mandi");

  return (
    <AppShell
      role="farmer"
      userName={user?.name || "Farmer"}
      sidebarItems={farmerSidebar}
      bottomNavItems={farmerBottomNav}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Sparkles className="h-4 w-4" /> Google Maps Platform & Dynamic Autocomplete Active
          </div>
          <h1 className="text-3xl font-black text-foreground md:text-5xl tracking-tight">
            Create Harvest Shipment & Google Route
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-medium">
            Type your Mandi or pickup spot to see live dynamic suggestions, or click "Use My Current Location".
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-muted/70 p-1.5 border border-border max-w-md mx-auto shadow-inner">
          <button
            onClick={() => setEntryMode("manual")}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold transition-all ${
              entryMode === "manual"
                ? "bg-brand-gradient text-brand-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            📝 Fill Form Manually
          </button>

          <button
            onClick={() => setEntryMode("voice")}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold transition-all ${
              entryMode === "voice"
                ? "bg-brand-gradient text-brand-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mic className="h-4 w-4" />
            🎙️ Voice AI Auto-Fill
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Side: Form Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Mode A: Voice AI */}
            {entryMode === "voice" && (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2 flex-wrap bg-card p-3.5 rounded-2xl border border-border">
                  <Globe className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-xs font-bold text-muted-foreground mr-2">Language:</span>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all ${
                        language === lang.code
                          ? "bg-brand text-brand-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {lang.flag} {lang.native}
                    </button>
                  ))}
                </div>

                {!extracted && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-brand/20 bg-brand-muted/30 p-4">
                      <p className="text-[10px] uppercase font-bold text-brand">Spoken Example</p>
                      <p className="mt-1 text-sm font-medium text-foreground italic">
                        "मेरा 5000 किलो आलू है, आगरा मंडी भेजना है, 15 अगस्त को"
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-border bg-card p-8 shadow-xl">
                      <div className="relative flex items-center justify-center">
                        {isListening && (
                          <span
                            className="absolute rounded-full bg-brand/30 animate-ping"
                            style={{ width: `${140 + audioLevel * 1.5}px`, height: `${140 + audioLevel * 1.5}px` }}
                          />
                        )}

                        <button
                          type="button"
                          onClick={isListening ? stopListening : startListening}
                          className={`group relative flex h-32 w-32 items-center justify-center rounded-full shadow-2xl transition-transform hover:scale-105 ${
                            isListening ? "bg-red-500 text-white" : "bg-brand-gradient text-brand-foreground shadow-brand/40"
                          }`}
                        >
                          {isListening ? (
                            <Square className="h-10 w-10 animate-pulse" />
                          ) : (
                            <Mic className="h-12 w-12" />
                          )}
                        </button>
                      </div>

                      <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-foreground">
                          {isListening ? "Recording Live Speech..." : "Tap Mic to Record Voice"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Say crop type, weight in kg, pickup village & target mandi
                        </p>
                      </div>

                      {(transcript || interimTranscript) && (
                        <div className="w-full rounded-2xl bg-muted/30 border border-border p-4 text-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Transcript</span>
                          <p className="text-sm font-semibold text-foreground">
                            {transcript} <span className="text-brand font-normal italic">{interimTranscript}</span>
                          </p>
                        </div>
                      )}

                      {/* Two-Step Bhashini + LLM Architecture Badge */}
                      <div className="w-full rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3 text-[11px] text-left space-y-1.5">
                        <div className="flex items-center gap-1.5 font-extrabold text-blue-700 dark:text-blue-400">
                          <span>🇮🇳 Bhashini ASR + Gemini LLM Two-Step Pipeline</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                          <span className="rounded-lg bg-background p-1.5 border border-border">1️⃣ Bhashini Indic ASR: Regional Speech-to-Text</span>
                          <span className="rounded-lg bg-background p-1.5 border border-border">2️⃣ Gemini LLM: Structured Field Extraction</span>
                        </div>
                      </div>

                      {transcript && (
                        <button
                          type="button"
                          onClick={handleProcessVoice}
                          disabled={isProcessingPipeline}
                          className="inline-flex items-center gap-2 rounded-2xl bg-brand-gradient px-6 py-3 text-sm font-bold text-brand-foreground shadow-lg shadow-brand/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="h-4 w-4" />
                          {isProcessingPipeline ? "Running Bhashini ASR + Gemini Extraction..." : "Extract Crop Fields with Bhashini + LLM"}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {extracted && (
                  <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-xl">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="h-5 w-5" />
                        AI Extraction Verified
                      </div>
                      <button
                        type="button"
                        onClick={() => setExtracted(null)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Re-record
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                        <label className="text-xs text-muted-foreground font-semibold">Produce Name</label>
                        <input
                          type="text"
                          value={extracted.produce_type}
                          onChange={(e) => setExtracted({ ...extracted, produce_type: e.target.value })}
                          className="w-full mt-1 bg-transparent font-bold text-foreground text-sm focus:outline-none"
                        />
                      </div>

                      <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                        <label className="text-xs text-muted-foreground font-semibold">Weight (Kilograms - kg)</label>
                        <input
                          type="number"
                          value={extracted.quantity_kg}
                          onChange={(e) => setExtracted({ ...extracted, quantity_kg: parseInt(e.target.value) || 0 })}
                          className="w-full mt-1 bg-transparent font-bold text-foreground text-sm focus:outline-none"
                        />
                      </div>

                      <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                        <label className="text-xs text-muted-foreground font-semibold">Pickup Location</label>
                        <input
                          type="text"
                          value={extracted.pickup_village}
                          onChange={(e) => setExtracted({ ...extracted, pickup_village: e.target.value })}
                          className="w-full mt-1 bg-transparent font-bold text-foreground text-sm focus:outline-none"
                        />
                      </div>

                      <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                        <label className="text-xs text-muted-foreground font-semibold">Destination Mandi</label>
                        <input
                          type="text"
                          value={extracted.destination_mandi}
                          onChange={(e) => setExtracted({ ...extracted, destination_mandi: e.target.value })}
                          className="w-full mt-1 bg-transparent font-bold text-foreground text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleConfirmVoiceShipment}
                      className="w-full rounded-2xl bg-brand-gradient py-4 text-base font-bold text-brand-foreground shadow-xl hover:opacity-95 transition-all"
                    >
                      {submitting ? "Posting Shipment..." : "Post Shipment to Truck Drivers"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mode B: Manual Form with Dynamic Suggestions & GPS Location Button */}
            {entryMode === "manual" && (
              <form onSubmit={handleManualFormSubmit} className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="text-lg font-black text-foreground">Crop Shipment Form</h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Direct Farmer Booking
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-foreground mb-1.5">Crop / Produce Name</label>
                    <input
                      type="text"
                      list="crop-suggestions-manual"
                      required
                      value={manualProduce}
                      onChange={(e) => setManualProduce(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-bold text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-brand/40"
                      placeholder="e.g. Potato, Onion, Tomato, Wheat"
                    />
                    <datalist id="crop-suggestions-manual">
                      <option value="Potato (आलू)" />
                      <option value="Onion (प्याज)" />
                      <option value="Tomato (टमाटर)" />
                      <option value="Wheat (गेहूं)" />
                      <option value="Paddy / Rice (धान)" />
                      <option value="Green Chilli (हरी मिर्च)" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-foreground mb-1.5">Load Weight (Kilograms - kg)</label>
                    <input
                      type="number"
                      required
                      min="10"
                      value={manualKg}
                      onChange={(e) => setManualKg(parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-bold text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-brand/40"
                      placeholder="4000"
                    />
                    <span className="text-[10px] text-muted-foreground font-semibold mt-1 block">{manualKg} kg total weight</span>
                  </div>

                  {/* Dynamic Autocomplete Pickup Spot */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-foreground">Starting Pickup Spot</span>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={isLocating}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all border border-blue-500/20"
                      >
                        <Locate className={`h-3.5 w-3.5 ${isLocating ? "animate-spin" : ""}`} />
                        {isLocating ? "Locating..." : "📍 Use My Current Location"}
                      </button>
                    </div>
                    <LocationAutocompleteInput
                      label=""
                      type="pickup"
                      value={manualPickup}
                      onChange={setManualPickup}
                      placeholder="Start typing village, town or hub..."
                      onAddNewCustom={(name) => toast.success(`Selected custom pickup spot: ${name}`)}
                    />
                  </div>

                  {/* Dynamic Autocomplete Mandi Selection */}
                  <div>
                    <LocationAutocompleteInput
                      label="Target Destination Mandi (All-India States)"
                      type="mandi"
                      value={manualMandi}
                      onChange={setManualMandi}
                      placeholder="Start typing Mandi name, city or state..."
                      onAddNewCustom={(name) => toast.success(`Selected target Mandi: ${name}`)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-black text-foreground mb-1.5">Target Pickup Date</label>
                      <input
                        type="date"
                        required
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-bold text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-brand/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-foreground mb-1.5">Farmer Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={manualPhone}
                        onChange={(e) => setManualPhone(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-bold text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-brand/40"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-brand-muted/80 to-brand-muted/30 p-4 flex items-center justify-between border border-brand/20">
                  <div>
                    <span className="text-xs text-brand font-extrabold block">Estimated Shared Freight Fare</span>
                    <span className="text-2xl font-black text-brand">₹{Math.round(manualKg * 0.4)}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-white/90 dark:bg-black/40 px-3.5 py-1.5 rounded-xl border border-emerald-500/20">
                    ~45% Saved
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-brand-gradient py-4 text-base font-extrabold text-brand-foreground shadow-xl hover:opacity-95 transition-all"
                >
                  {submitting ? "Posting Shipment..." : "Submit Form & Connect Drivers"}
                </button>
              </form>
            )}
          </div>

          {/* Right Side: Official Pure Google Maps Engine (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <PureGoogleMap
              pickupLocation={currentPickup}
              destinationMandi={currentMandi}
              userCoords={userCoords}
              onSelectPickupLocation={(loc) => {
                setManualPickup(loc);
                toast.success(`Selected starting pickup spot: ${loc}`);
              }}
              onSelectDestinationMandi={(mandi) => {
                setManualMandi(mandi);
                toast.success(`Selected target Mandi: ${mandi}`);
              }}
              height="480px"
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Mic, Globe, Truck, ArrowRight, Sparkles, ShieldCheck, MapPin, CheckCircle2, Navigation } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { loginAs } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-md shadow-brand/20">
              <Leaf className="h-5 w-5 text-brand-foreground" />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">AgroVoice</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2 text-xs font-bold text-brand-foreground shadow-md hover:opacity-95 transition-all"
            >
              Portal Sign In
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-muted px-4 py-1.5 text-xs font-bold text-brand">
                <Sparkles className="h-3.5 w-3.5" />
                AI Voice-First & Shared Logistics Platform
              </span>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground md:text-6xl">
                Speak your shipment. <span className="text-brand">Share a truck.</span> Save on freight.
              </h1>
              <p
                className="text-lg font-medium text-muted-foreground"
                style={{ fontFamily: "'Noto Sans Devanagari', var(--font-sans)" }}
              >
                अपनी फसल के बारे में बोलें — हम आपके लिए ट्रक ढूंढेंगे।
              </p>
              <p className="max-w-xl text-base text-muted-foreground leading-relaxed">
                AgroVoice connects Indian farmers directly with transport drivers heading to Mandis. Simply record a voice note in Hindi, Tamil, Telugu, Marathi, or Kannada, and get matched with empty truck space.
              </p>

              {/* 3 Portal Selection CTAs */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Select a Portal to Access:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link
                    to="/login"
                    onClick={() => loginAs("farmer")}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-bold hover:scale-105 transition-all shadow-sm text-center"
                  >
                    <Leaf className="h-6 w-6 mb-1 text-emerald-600 dark:text-emerald-400" />
                    <span>🧑‍🌾 Farmer Portal</span>
                    <span className="text-[10px] font-normal text-muted-foreground mt-1">Voice AI & Mandi Rates</span>
                  </Link>

                  <Link
                    to="/login"
                    onClick={() => loginAs("driver")}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold hover:scale-105 transition-all shadow-sm text-center"
                  >
                    <Truck className="h-6 w-6 mb-1 text-amber-600 dark:text-amber-400" />
                    <span>🚛 Driver Hub</span>
                    <span className="text-[10px] font-normal text-muted-foreground mt-1">Interactive Route Maps</span>
                  </Link>

                  <Link
                    to="/login"
                    onClick={() => loginAs("admin")}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-300 font-bold hover:scale-105 transition-all shadow-sm text-center"
                  >
                    <ShieldCheck className="h-6 w-6 mb-1 text-sky-600 dark:text-sky-400" />
                    <span>🛡️ Admin Portal</span>
                    <span className="text-[10px] font-normal text-muted-foreground mt-1">Analytics & Supervision</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Interactive Voice Player Card */}
            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-brand-muted blur-3xl opacity-60" />
              <div className="rounded-3xl border border-border bg-card p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-bold text-xs text-foreground">Live Voice AI Speech Recognition</span>
                  </div>
                  <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">hi-IN</span>
                </div>

                <div className="flex flex-col items-center gap-6 py-4">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-brand/30" />
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-brand-gradient shadow-2xl shadow-brand/40">
                      <Mic className="h-12 w-12 text-brand-foreground" />
                    </div>
                  </div>
                  <div className="text-center bg-muted/30 p-4 rounded-2xl border border-border w-full">
                    <p className="text-sm font-bold text-foreground">
                      "मेरा 50 क्विंटल आलू है, आगरा मंडी भेजना है, 15 जनवरी को"
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-400">
                    <span>Parsed Crop: Potato (आलू)</span>
                    <span>Quantity: 50 Quintals</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Pickup: Aligarh Hub</span>
                    <span>Destination: Agra Mandi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="border-y border-border bg-muted/20 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3 md:px-6">
          <FeatureCard
            icon={Mic}
            title="Speech-to-Text AI"
            body="Speak in Hindi, Tamil, Telugu, Marathi, or Kannada. Our AI extracts crop, quantity, and destination fields automatically."
          />
          <FeatureCard
            icon={Sparkles}
            title="Kisan Mitr Assistant"
            body="Interactive AI helper for farmers providing instant crop leaf disease diagnosis, live Mandi price trends, and freight savings."
          />
          <FeatureCard
            icon={Navigation}
            title="Driver Route Maps"
            body="Interactive GPS route maps for truck drivers to pick up partial farmer loads along their path to Mandis."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} AgroVoice Connect &bull; Built for Indian Farmers & Transporters</span>
          <div className="flex gap-4">
            <Link to="/login" onClick={() => loginAs("farmer")} className="hover:underline">Farmers</Link>
            <Link to="/login" onClick={() => loginAs("driver")} className="hover:underline">Drivers</Link>
            <Link to="/login" onClick={() => loginAs("admin")} className="hover:underline">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:border-brand/40 transition-all space-y-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-muted text-brand font-bold">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

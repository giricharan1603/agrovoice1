import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Package, TrendingUp, Calendar, Sparkles, MapPin, Truck, CheckCircle2, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { farmerSidebar, farmerBottomNav } from "@/components/layout/nav-config";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/farmer/dashboard")({
  head: () => ({
    meta: [{ title: "Farmer Dashboard — AgroVoice" }],
  }),
  component: FarmerDashboardPage,
});

function FarmerDashboardPage() {
  const { user, shipments } = useAuth();

  const totalKgMoved = shipments.reduce((sum, s) => sum + (s.quantityKg || 0), 0);
  const totalFare = shipments.reduce((sum, s) => sum + (s.estimatedFare || (s as any).estimatedCost || 0), 0);

  return (
    <AppShell
      role="farmer"
      userName={user?.name || "Farmer"}
      sidebarItems={farmerSidebar}
      bottomNavItems={farmerBottomNav}
    >
      <div className="space-y-8">
        {/* Banner Section */}
        <section className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-brand-foreground shadow-xl shadow-brand/25 md:p-8">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Voice AI & Direct Mandi Logistics
            </span>
            <h1 className="mt-3 text-2xl font-black md:text-4xl leading-tight">
              Namaste {user?.name || "Kisan Brother"}! 👋
            </h1>
            <p className="mt-2 max-w-xl text-sm md:text-base opacity-95">
              Speak your crop load in Kilograms (kg) or use the manual form. We automatically match you with truck drivers heading to your mandi.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/farmer/new-shipment"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-900 shadow-md transition-transform hover:scale-105"
              >
                <Mic className="h-4 w-4 text-emerald-600 animate-pulse" />
                Create Crop Shipment
              </Link>
              <Link
                to="/farmer/ai-assistant"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 text-sm font-bold backdrop-blur hover:bg-white/25 border border-white/20"
              >
                <Sparkles className="h-4 w-4" />
                AgroVoice AI Assistant
              </Link>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        </section>

        {/* Stats Row in Kilograms */}
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard icon={Package} label="Total Crop Load" value={`${totalKgMoved} kg`} sub={`${shipments.length} Active Shipments`} />
          <StatCard icon={TrendingUp} label="Total Freight Value" value={`₹${totalFare}`} sub="Estimated transport fare" />
          <StatCard icon={Calendar} label="Matched Drivers" value={shipments.filter(s => s.status === 'matched').length.toString()} sub="Assigned for pickup" />
        </section>

        {/* Mandi Live Rate Ticker in ₹/kg */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="font-bold text-foreground">Live All-India Mandi Rates (₹ / kg)</h3>
            </div>
            <span className="text-xs text-muted-foreground">Updated live</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <MandiPriceCard crop="Potato (आलू)" mandi="Agra Central Mandi" price="₹21 / kg" trend="+5%" />
            <MandiPriceCard crop="Onion (प्याज)" mandi="Azadpur Mandi Delhi" price="₹24 / kg" trend="+8%" />
            <MandiPriceCard crop="Tomato (टमाटर)" mandi="Vashi APMC Mumbai" price="₹18 / kg" trend="-2%" />
            <MandiPriceCard crop="Wheat (गेहूं)" mandi="Indore Malwa Mandi" price="₹25 / kg" trend="+3%" />
          </div>
        </section>

        {/* Active Shipments List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">My Active Crop Shipments</h2>
            <Link to="/farmer/new-shipment" className="text-xs font-bold text-brand hover:underline">
              + Post New Crop Load
            </Link>
          </div>

          {shipments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-semibold text-foreground">No active crop shipments registered</p>
              <p className="text-xs text-muted-foreground mt-1">Tap above to post your harvest details using voice or manual form.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {shipments.map((s) => (
                <div key={s.id} className="rounded-3xl border border-border bg-card p-5 shadow-xs hover:border-brand/40 transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-muted-foreground">{s.id}</span>
                      <h3 className="text-lg font-bold text-foreground">{s.cropType || (s as any).produceType}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      s.status === 'matched' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {s.status === 'matched' ? 'Driver Assigned' : 'Searching Driver'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Load Weight</span>
                      <p className="font-black text-foreground text-sm">{s.quantityKg} kg</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Freight Fare</span>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">₹{s.estimatedFare || (s as any).estimatedCost}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pickup</span>
                      <p className="font-semibold text-foreground">{s.pickupLocation}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Destination</span>
                      <p className="font-semibold text-foreground">{s.destinationMandi}</p>
                    </div>
                  </div>

                  {s.driverName && (
                    <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-amber-600" />
                        <span className="font-semibold text-foreground">Driver: {s.driverName}</span>
                      </div>
                      <span className="text-emerald-600 font-bold">Assigned</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-muted">
          <Icon className="h-4 w-4 text-brand" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-black text-foreground">{value}</p>
      <span className="text-[10px] text-muted-foreground mt-0.5 block">{sub}</span>
    </div>
  );
}

function MandiPriceCard({ crop, mandi, price, trend }: { crop: string; mandi: string; price: string; trend: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-3.5">
      <span className="text-xs font-bold text-foreground block">{crop}</span>
      <span className="text-[11px] text-muted-foreground block">{mandi}</span>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-black text-brand text-sm">{price}</span>
        <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{trend}</span>
      </div>
    </div>
  );
}

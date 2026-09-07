import { createFileRoute } from "@tanstack/react-router";
import { Users, Truck, Package, TrendingUp, ShieldCheck, Activity, DollarSign } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { adminSidebar, adminBottomNav } from "@/components/layout/nav-config";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [{ title: "Admin Overview — AgroVoice Analytics" }],
  }),
  component: AdminDashboardPage,
});

const SHIPMENT_VOLUME_DATA = [
  { day: "Mon", volume: 12000, savings: 48000 },
  { day: "Tue", volume: 18000, savings: 72000 },
  { day: "Wed", volume: 24000, savings: 96000 },
  { day: "Thu", volume: 31000, savings: 124000 },
  { day: "Fri", volume: 29000, savings: 116000 },
  { day: "Sat", volume: 42000, savings: 168000 },
  { day: "Sun", volume: 51000, savings: 204000 },
];

const CROP_DISTRIBUTION_DATA = [
  { crop: "Potato (आलू)", kg: 450000 },
  { crop: "Onion (प्याज)", kg: 380000 },
  { crop: "Tomato (टमाटर)", kg: 290000 },
  { crop: "Wheat (गेहूं)", kg: 520000 },
  { crop: "Paddy (धान)", kg: 410000 },
];

function AdminDashboardPage() {
  const { shipments, driverRoutes } = useAuth();

  return (
    <AppShell
      role="admin"
      userName="Admin"
      sidebarItems={adminSidebar}
      bottomNavItems={adminBottomNav}
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Platform Master Console & Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time oversight across active farmers, registered drivers, load matching, and total freight savings.
          </p>
        </div>

        {/* Top KPI Cards */}
        <section className="grid gap-4 md:grid-cols-4">
          <Kpi icon={Users} label="Verified Farmers" value="1,248" sub="128 active today" />
          <Kpi icon={Truck} label="Registered Drivers" value="482" sub="86 trucks on road" />
          <Kpi icon={Package} label="Total Shipments" value={shipments.length ? (shipments.length + 2480).toString() : "2,480"} sub="Total Weight: 842,000 kg" />
          <Kpi icon={TrendingUp} label="Total Freight Saved" value="₹34.2 Lakhs" sub="Average ~46% saving" />
        </section>

        {/* Charts Grid */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Chart 1: Daily Volume */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Daily Shipment Volume (Kilograms - kg)</h3>
                <p className="text-xs text-muted-foreground">Volume moved over the last 7 days</p>
              </div>
              <Activity className="h-5 w-5 text-sky-500" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SHIPMENT_VOLUME_DATA}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="volume" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Commodity Distribution */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Commodity Breakdown (Total kg)</h3>
                <p className="text-xs text-muted-foreground">Most transported agricultural crops</p>
              </div>
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CROP_DISTRIBUTION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="crop" stroke="#888888" fontSize={10} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="kg" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Live System Activity Log */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Live Platform Activity Log</h3>
          <div className="space-y-3">
            <ActivityItem time="2m ago" title="New Shipment Matched" desc="Ramesh Sharma's 3,500 kg Potato load matched with Gurpreet's Truck (UP 80 AT 4921)" status="matched" />
            <ActivityItem time="15m ago" title="Voice AI Transcription" desc="Voice shipment recorded in Hindi (5,000 kg Onion to Azadpur Mandi)" status="pending" />
            <ActivityItem time="1h ago" title="Driver Route Published" desc="Harbhajan Lal added route Bulandshahr -> Azadpur Mandi (4,000 kg capacity)" status="active" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Kpi({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-black text-foreground">{value}</p>
      <span className="text-[10px] text-muted-foreground mt-0.5 block">{sub}</span>
    </div>
  );
}

function ActivityItem({ time, title, desc, status }: { time: string; title: string; desc: string; status: string }) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-border p-3.5 bg-muted/20">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-xs">{title}</span>
          <span className="text-[10px] text-muted-foreground">&bull; {time}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
        System OK
      </span>
    </div>
  );
}

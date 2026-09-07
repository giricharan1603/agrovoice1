import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, Package, IndianRupee, Gauge, Navigation, PlusCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { driverSidebar, driverBottomNav } from "@/components/layout/nav-config";
import { InteractiveRouteMap } from "@/components/driver/InteractiveRouteMap";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/driver/dashboard")({
  head: () => ({
    meta: [{ title: "Driver Hub & Route Map — AgroVoice" }],
  }),
  component: DriverDashboardPage,
});

function DriverDashboardPage() {
  const { user, driverRoutes, shipments } = useAuth();
  const activeRoute = driverRoutes[0] || {
    vehicleNumber: "UP 80 AT 4921",
    totalCapacityQuintals: 100,
    availableCapacityQuintals: 50,
  };

  const bookedQuintals = activeRoute.totalCapacityQuintals - activeRoute.availableCapacityQuintals;
  const bookedPercent = Math.round((bookedQuintals / activeRoute.totalCapacityQuintals) * 100);

  return (
    <AppShell
      role="driver"
      userName={user?.name || "Gurpreet Singh"}
      sidebarItems={driverSidebar}
      bottomNavItems={driverBottomNav}
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Driver Route & Load Hub
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Vehicle: <span className="font-bold text-foreground">{activeRoute.vehicleNumber}</span> &bull; Active Mandi Route
            </p>
          </div>
          <Link
            to="/driver/route-setup"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            + Configure New Route
          </Link>
        </div>

        {/* Driver KPI Cards */}
        <section className="grid gap-4 md:grid-cols-4">
          <Stat icon={Package} label="Booked Load" value={`${bookedQuintals} Q`} sub={`${bookedPercent}% Capacity Full`} />
          <Stat icon={Gauge} label="Total Capacity" value={`${activeRoute.totalCapacityQuintals} Q`} sub="Eicher 10.90 Truck" />
          <Stat icon={Truck} label="Remaining Space" value={`${activeRoute.availableCapacityQuintals} Q`} sub="Available for pickup" />
          <Stat icon={IndianRupee} label="Estimated Revenue" value="₹3,400" sub="3 Matched Loads" />
        </section>

        {/* Interactive Leaflet Route Map */}
        <InteractiveRouteMap />
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-black text-foreground">{value}</p>
      <span className="text-[10px] text-muted-foreground mt-0.5 block">{sub}</span>
    </div>
  );
}

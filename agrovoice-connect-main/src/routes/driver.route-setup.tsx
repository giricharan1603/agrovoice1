import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Truck, MapPin, Calendar, IndianRupee, Navigation, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/AppShell";
import { driverSidebar, driverBottomNav } from "@/components/layout/nav-config";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/driver/route-setup")({
  head: () => ({
    meta: [{ title: "Route Setup & Capacity Builder — AgroVoice" }],
  }),
  component: RouteSetupPage,
});

function RouteSetupPage() {
  const navigate = useNavigate();
  const { user, addDriverRoute } = useAuth();

  const [origin, setOrigin] = useState("Aligarh / Hathras Hub");
  const [destinationMandi, setDestinationMandi] = useState("Agra Central Mandi");
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicleNumber || "UP 80 AT 4921");
  const [vehicleType, setVehicleType] = useState("Eicher 10.90 (10 Ton Truck)");
  const [capacityKg, setCapacityKg] = useState(8000);
  const [pricePerKg, setPricePerKg] = useState(0.4);
  const [departureTime, setDepartureTime] = useState("Tomorrow, 6:00 AM");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDriverRoute({
      driverId: user?.id || "d-202",
      driverName: user?.name || "Gurpreet Singh",
      driverPhone: user?.phone || "+91 98123 45678",
      vehicleNumber,
      vehicleType,
      totalCapacityKg: capacityKg,
      origin,
      destinationMandi,
      departureTime,
      pricePerKg,
    });

    toast.success(`Transport route ${origin} -> ${destinationMandi} published!`);
    navigate({ to: "/driver/dashboard" });
  };

  return (
    <AppShell
      role="driver"
      userName={user?.name || "Gurpreet Singh"}
      sidebarItems={driverSidebar}
      bottomNavItems={driverBottomNav}
    >
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Configure Driver Route & Load Capacity
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish your transport route to start receiving matching farmer load requests.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xl space-y-6">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Route publishing will broadcast your truck availability to farmers along the way.
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Starting Hub / Village</label>
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                placeholder="Aligarh / Hathras Hub"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Destination Mandi</label>
              <input
                type="text"
                list="driver-mandi-list"
                required
                value={destinationMandi}
                onChange={(e) => setDestinationMandi(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                placeholder="Agra Central Mandi"
              />
              <datalist id="driver-mandi-list">
                <option value="Agra Central Mandi" />
                <option value="Azadpur Mandi, Delhi" />
                <option value="Vashi APMC Mandi, Mumbai" />
                <option value="Guntur Mirchi Yard" />
                <option value="Indore Central Mandi" />
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Vehicle Registration Number</label>
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold uppercase text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                placeholder="UP 80 AT 4921"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Vehicle Model / Category</label>
              <input
                type="text"
                required
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                placeholder="Eicher 10.90 (10 Ton)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Total Available Capacity (Kilograms - kg)</label>
              <input
                type="number"
                required
                value={capacityKg}
                onChange={(e) => setCapacityKg(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                placeholder="8000"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Freight Rate (₹ / kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={pricePerKg}
                onChange={(e) => setPricePerKg(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                placeholder="0.4"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Departure Schedule & Time Window</label>
            <input
              type="text"
              required
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              placeholder="Tomorrow, 6:00 AM"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-amber-gradient py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all"
          >
            Publish Route & Enable GPS Load Matching
          </button>
        </form>
      </div>
    </AppShell>
  );
}

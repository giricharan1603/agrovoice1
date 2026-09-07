import React, { useEffect, useState, useRef } from "react";
import { Truck, MapPin, Navigation, Package, Check, X, ShieldAlert, Play, CheckCircle2, Flag } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth, Shipment } from "@/lib/auth-context";

export function InteractiveRouteMap() {
  const { shipments, driverRoutes, updateShipmentStatus, user } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  // Map Filter Choice: "all" (All Available Loads) vs "accepted" (Accepted Orders Only)
  const [mapFilterMode, setMapFilterMode] = useState<"all" | "accepted">("all");

  const activeDriverRoute = driverRoutes[0] || {
    origin: "Aligarh / Hathras Hub",
    destinationMandi: "Agra Central Mandi",
    totalCapacityKg: 10000,
    availableCapacityKg: 5000,
  };

  // Filter shipments based on map mode
  const displayedShipments = shipments.filter((shp) => {
    if (mapFilterMode === "accepted") {
      return shp.status === "matched" || shp.status === "in_transit";
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }

      // India Mandi Route Coordinates [Aligarh -> Hathras -> Agra]
      const aligarhCoords: [number, number] = [27.8974, 78.088];
      const hathrasCoords: [number, number] = [27.595, 78.052];
      const khurjaCoords: [number, number] = [28.253, 77.857];
      const agraMandiCoords: [number, number] = [27.1767, 78.0081];

      const map = L.map(mapContainerRef.current).setView([27.55, 78.05], 9);
      leafletMapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const truckIcon = L.divIcon({
        className: "custom-leaflet-truck",
        html: `<div style="background-color: #d97706; color: white; padding: 6px; border-radius: 9999px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const pickupIcon = L.divIcon({
        className: "custom-leaflet-pickup",
        html: `<div style="background-color: #10b981; color: white; padding: 6px; border-radius: 9999px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const mandiIcon = L.divIcon({
        className: "custom-leaflet-mandi",
        html: `<div style="background-color: #0284c7; color: white; padding: 6px; border-radius: 9999px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M10 12h4"/></svg></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      // Add Truck Marker
      L.marker(aligarhCoords, { icon: truckIcon })
        .addTo(map)
        .bindPopup("<b>Gurpreet's Truck (UP 80 AT 4921)</b><br/>Current Position: Aligarh Hub<br/>Remaining Space: 5,000 kg");

      // Render Pickups based on filter
      if (mapFilterMode === "all") {
        L.marker(hathrasCoords, { icon: pickupIcon })
          .addTo(map)
          .bindPopup("<b>Pickup 1 (ACCEPTED): Hathras</b><br/>Produce: Potato (3,500 kg)<br/>Farmer: Ramesh Sharma");

        L.marker(khurjaCoords, { icon: pickupIcon })
          .addTo(map)
          .bindPopup("<b>Pickup 2 (AVAILABLE): Khurja</b><br/>Produce: Onion (2,000 kg)<br/>Farmer: Suresh Patel");
      } else {
        // Accepted Orders Only
        L.marker(hathrasCoords, { icon: pickupIcon })
          .addTo(map)
          .bindPopup("<b>Accepted Order: Hathras</b><br/>Produce: Potato (3,500 kg)<br/>Status: Driver Assigned & Scheduled");
      }

      // Add Mandi Marker
      L.marker(agraMandiCoords, { icon: mandiIcon })
        .addTo(map)
        .bindPopup("<b>Destination: Agra Central Mandi</b><br/>Arrival ETA: Today, 3:30 PM");

      const routePoints = mapFilterMode === "all"
        ? [aligarhCoords, khurjaCoords, hathrasCoords, agraMandiCoords]
        : [aligarhCoords, hathrasCoords, agraMandiCoords];

      const routePolyline = L.polyline(routePoints, {
        color: mapFilterMode === "accepted" ? "#10b981" : "#d97706",
        weight: 5,
        opacity: 0.85,
        dashArray: "8, 8",
      }).addTo(map);

      map.fitBounds(routePolyline.getBounds(), { padding: [30, 30] });
    });

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mapFilterMode]);

  const handleStartRide = (shipmentId: string) => {
    updateShipmentStatus(shipmentId, "in_transit");
    toast.success("🚀 Ride Started! Live GPS Navigation & Tracking Active.");
  };

  const handleCompleteRide = (shipmentId: string) => {
    updateShipmentStatus(shipmentId, "delivered");
    toast.success("🏁 Ride Completed & Delivered to Mandi! Payment & Receipt Generated.");
  };

  return (
    <div className="space-y-6">
      {/* Map Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        {/* Map Header with Choice Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Driver Transport GPS Map</h3>
              <p className="text-xs text-muted-foreground">
                {activeDriverRoute.origin} &rarr; {activeDriverRoute.destinationMandi}
              </p>
            </div>
          </div>

          {/* User Request Choice: Toggle Map between Accepted Orders vs All Available Requests */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-muted/70 p-1 border border-border">
            <button
              onClick={() => setMapFilterMode("all")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                mapFilterMode === "all"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🚚 All Route Loads
            </button>
            <button
              onClick={() => setMapFilterMode("accepted")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                mapFilterMode === "accepted"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📦 Accepted Orders Only
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div ref={mapContainerRef} className="h-[380px] w-full bg-muted/20" />

        {/* Route Stats Footer */}
        <div className="grid grid-cols-2 gap-4 border-t border-border bg-card p-4 text-center md:grid-cols-4">
          <div>
            <span className="text-xs text-muted-foreground">Map Mode</span>
            <p className="font-bold text-foreground">
              {mapFilterMode === "accepted" ? "Accepted Orders Only" : "All Nearby Loads"}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Trip Distance</span>
            <p className="font-bold text-foreground">84 km</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Remaining Capacity</span>
            <p className="font-bold text-emerald-600 dark:text-emerald-400">
              {activeDriverRoute.availableCapacityKg} / {activeDriverRoute.totalCapacityKg} kg
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Estimated Trip Revenue</span>
            <p className="font-bold text-amber-600 dark:text-amber-400">₹3,400</p>
          </div>
        </div>
      </div>

      {/* Driver Load Requests List & Start Ride Controls */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {mapFilterMode === "accepted" ? "Accepted Orders & Ride Management" : "Available Farmer Load Requests"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {mapFilterMode === "accepted"
                ? "Manage accepted trips, start live GPS navigation, and complete deliveries"
                : "Farmer requests along your route heading to " + activeDriverRoute.destinationMandi}
            </p>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            Showing {displayedShipments.length} Orders
          </span>
        </div>

        <div className="space-y-3">
          {displayedShipments.map((shp) => (
            <div
              key={shp.id}
              className={`flex flex-col justify-between gap-4 rounded-2xl border p-4 transition-all md:flex-row md:items-center ${
                shp.status === "in_transit"
                  ? "border-amber-500/50 bg-amber-500/10 shadow-md"
                  : shp.status === "matched"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-border bg-card hover:border-amber-500/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-muted text-brand font-bold">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{shp.produceType}</span>
                    <span className="rounded-lg bg-muted px-2.5 py-0.5 text-xs font-black text-muted-foreground">
                      {shp.quantityKg} kg
                    </span>
                    {shp.status === "in_transit" && (
                      <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-600 animate-pulse">
                        🟢 RIDE IN PROGRESS
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <MapPin className="inline h-3 w-3 text-brand" /> Pickup: {shp.pickupLocation} &bull; Mandi: {shp.destinationMandi}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Farmer: {shp.farmerName} ({shp.farmerPhone})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <div className="text-right mr-2">
                  <span className="block text-sm font-bold text-foreground">₹{shp.estimatedCost} Freight</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    +{Math.round(shp.quantityKg * 0.4)} Earnings
                  </span>
                </div>

                {/* Option 1: Accept Order */}
                {shp.status === "pending" && (
                  <button
                    onClick={() =>
                      updateShipmentStatus(shp.id, "matched", {
                        driverId: user?.id || "d-202",
                        driverName: user?.name || "Gurpreet Singh",
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    Accept Order
                  </button>
                )}

                {/* Option 2: Start Ride Button for Accepted Orders */}
                {shp.status === "matched" && (
                  <button
                    onClick={() => handleStartRide(shp.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-amber-600 hover:to-amber-700 transition-all animate-bounce"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    🚀 Start Ride & Navigate
                  </button>
                )}

                {/* Option 3: In Transit State & Complete Ride Button */}
                {shp.status === "in_transit" && (
                  <button
                    onClick={() => handleCompleteRide(shp.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
                  >
                    <Flag className="h-4 w-4" />
                    🏁 Complete Ride & Deliver
                  </button>
                )}

                {shp.status === "delivered" && (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Trip Delivered
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

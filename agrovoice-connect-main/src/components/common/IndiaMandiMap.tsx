import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, TrendingUp, Truck, CheckCircle2 } from "lucide-react";

export interface MandiMarker {
  id: string;
  name: string;
  state: string;
  coords: [number, number];
  cropPriceKg: string;
  distanceKm: number;
  driversCount: number;
}

export const INDIAN_MANDIS: MandiMarker[] = [
  { id: "m1", name: "Agra Central Mandi", state: "Uttar Pradesh", coords: [27.1767, 78.0081], cropPriceKg: "₹21/kg", distanceKm: 42, driversCount: 6 },
  { id: "m2", name: "Azadpur Mandi", state: "Delhi NCR", coords: [28.7159, 77.176], cropPriceKg: "₹24/kg", distanceKm: 120, driversCount: 14 },
  { id: "m3", name: "Vashi APMC Mandi", state: "Mumbai, Maharashtra", coords: [19.077, 73.0033], cropPriceKg: "₹28/kg", distanceKm: 850, driversCount: 9 },
  { id: "m4", name: "Guntur Mirchi Yard", state: "Andhra Pradesh", coords: [16.2997, 80.4439], cropPriceKg: "₹180/kg", distanceKm: 1100, driversCount: 11 },
  { id: "m5", name: "Indore Malwa Mandi", state: "Madhya Pradesh", coords: [22.7196, 75.8577], cropPriceKg: "₹25/kg", distanceKm: 480, driversCount: 7 },
  { id: "m6", name: "Pimpalgaon Onion Yard", state: "Nashik, Maharashtra", coords: [20.1706, 73.9875], cropPriceKg: "₹26/kg", distanceKm: 760, driversCount: 12 },
  { id: "m7", name: "Yeshwanthpur APMC", state: "Bengaluru, Karnataka", coords: [13.0284, 77.5458], cropPriceKg: "₹30/kg", distanceKm: 1400, driversCount: 8 },
  { id: "m8", name: "Mahananda Mandi", state: "Jaipur, Rajasthan", coords: [26.9124, 75.7873], cropPriceKg: "₹22/kg", distanceKm: 340, driversCount: 5 },
];

interface IndiaMandiMapProps {
  selectedMandiName?: string;
  onSelectMandi?: (mandiName: string) => void;
}

export function IndiaMandiMap({ selectedMandiName, onSelectMandi }: IndiaMandiMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [activeMandi, setActiveMandi] = useState<MandiMarker>(INDIAN_MANDIS[0]);

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

      // India Central Coordinates [21.5, 78.9]
      const map = L.map(mapContainerRef.current).setView([22.0, 78.5], 5);
      leafletMapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      INDIAN_MANDIS.forEach((mandi) => {
        const customIcon = L.divIcon({
          className: "custom-mandi-pin",
          html: `<div style="background-color: #10b981; color: white; padding: 5px 9px; border-radius: 9999px; font-weight: bold; font-size: 11px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">📍 ${mandi.name.split(" ")[0]} (${mandi.cropPriceKg})</div>`,
          iconSize: [110, 30],
          iconAnchor: [55, 15],
        });

        const marker = L.marker(mandi.coords, { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <b style="font-size: 13px; color: #10b981;">${mandi.name}</b><br/>
            <span>State: ${mandi.state}</span><br/>
            <span>Live Price: <b>${mandi.cropPriceKg}</b></span><br/>
            <span>Nearby Drivers: <b>${mandi.driversCount} Trucks</b></span>
          </div>
        `);

        marker.on("click", () => {
          setActiveMandi(mandi);
          if (onSelectMandi) onSelectMandi(mandi.name);
        });
      });
    });

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="rounded-3xl border border-border bg-card shadow-lg overflow-hidden space-y-3">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Navigation className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-foreground">Interactive All-India Mandi & Driver GPS Map</h4>
            <p className="text-[10px] text-muted-foreground">Click any Mandi marker to view live prices & nearby truck drivers</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600">
          🇮🇳 India Coverage
        </span>
      </div>

      {/* Leaflet Map Box */}
      <div ref={mapContainerRef} className="h-[280px] w-full bg-muted/20" />

      {/* Selected Mandi Quick Info Bar */}
      {activeMandi && (
        <div className="mx-4 mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-brand-muted/40 p-3 text-center border border-brand/20">
          <div>
            <span className="text-[10px] text-muted-foreground block">Mandi</span>
            <span className="text-xs font-bold text-foreground">{activeMandi.name}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">Crop Price (kg)</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{activeMandi.cropPriceKg}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">Active Trucks</span>
            <span className="text-xs font-bold text-amber-600">{activeMandi.driversCount} Drivers</span>
          </div>
        </div>
      )}
    </div>
  );
}

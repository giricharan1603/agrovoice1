import React, { useEffect, useRef, useState } from "react";
import { Navigation, MapPin, CheckCircle2, ArrowRight } from "lucide-react";

export interface GeoLocation {
  name: string;
  coords: [number, number];
  type: "pickup" | "mandi";
}

// Indian Locations & Mandis Coordinate Database
export const INDIA_GEO_DATABASE: Record<string, [number, number]> = {
  // Mandis
  "agra central mandi": [27.1767, 78.0081],
  "agra mandi": [27.1767, 78.0081],
  "agra": [27.1767, 78.0081],
  "azadpur mandi, delhi": [28.7159, 77.176],
  "azadpur mandi": [28.7159, 77.176],
  "delhi": [28.6139, 77.209],
  "vashi apmc mandi, mumbai": [19.077, 73.0033],
  "vashi mandi": [19.077, 73.0033],
  "mumbai": [19.076, 72.8777],
  "guntur mirchi yard": [16.2997, 80.4439],
  "guntur mandi": [16.2997, 80.4439],
  "guntur": [16.2997, 80.4439],
  "indore central mandi": [22.7196, 75.8577],
  "indore mandi": [22.7196, 75.8577],
  "indore": [22.7196, 75.8577],
  "pimpalgaon onion yard, nashik": [20.1706, 73.9875],
  "nashik mandi": [20.1706, 73.9875],
  "nashik": [19.9975, 73.7898],
  "yeshwanthpur apmc, bengaluru": [13.0284, 77.5458],
  "bengaluru mandi": [13.0284, 77.5458],
  "bengaluru": [12.9716, 77.5946],
  "jaipur mandi": [26.9124, 75.7873],
  "jaipur": [26.9124, 75.7873],
  "lucknow mandi": [26.8467, 80.9462],
  "lucknow": [26.8467, 80.9462],

  // Villages & Towns
  "aligarh": [27.8974, 78.088],
  "aligarh hub": [27.8974, 78.088],
  "rampur, aligarh": [27.915, 78.092],
  "rampur": [28.8153, 79.025],
  "hathras": [27.595, 78.052],
  "hathras, up": [27.595, 78.052],
  "khurja": [28.253, 77.857],
  "khurja, bulandshahr": [28.253, 77.857],
  "bulandshahr": [28.407, 77.8498],
  "vijayawada": [16.5062, 80.648],
  "kanpur": [26.4499, 80.3319],
  "varanasi": [25.3176, 82.9739],
  "patna": [25.5941, 85.1376],
  "hyderabad": [17.385, 78.4867],
  "ludhiana": [30.901, 75.8573],
  "ahmedabad": [23.0225, 72.5714],
};

export function lookupCoords(text: string, defaultCoords: [number, number]): [number, number] {
  if (!text) return defaultCoords;
  const cleaned = text.toLowerCase().trim();

  for (const [key, coords] of Object.entries(INDIA_GEO_DATABASE)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return coords;
    }
  }

  // Fallback coords based on hash string for unrecognized inputs
  const hash = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = (hash % 50) / 100;
  const lngOffset = ((hash * 3) % 50) / 100;
  return [27.5 + latOffset, 78.0 + lngOffset];
}

interface DynamicRouteMapProps {
  pickupLocation: string;
  destinationMandi: string;
  onSelectPickupLocation?: (locationName: string) => void;
  onSelectDestinationMandi?: (mandiName: string) => void;
  height?: string;
  driverView?: boolean;
}

export function DynamicRouteMap({
  pickupLocation,
  destinationMandi,
  onSelectPickupLocation,
  onSelectDestinationMandi,
  height = "360px",
  driverView = false,
}: DynamicRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  const pickupCoords = lookupCoords(pickupLocation, [27.8974, 78.088]); // Aligarh default
  const mandiCoords = lookupCoords(destinationMandi, [27.1767, 78.0081]); // Agra Mandi default

  // Calculate approximate distance in km
  const R = 6371; // Earth's radius in km
  const dLat = ((mandiCoords[0] - pickupCoords[0]) * Math.PI) / 180;
  const dLon = ((mandiCoords[1] - pickupCoords[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pickupCoords[0] * Math.PI) / 180) *
      Math.cos((mandiCoords[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c) || 45;

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

      // Map Initialization
      const centerLat = (pickupCoords[0] + mandiCoords[0]) / 2;
      const centerLng = (pickupCoords[1] + mandiCoords[1]) / 2;

      const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 8);
      leafletMapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Custom Leaflet Icons
      const pickupIcon = L.divIcon({
        className: "custom-pickup-pin",
        html: `<div style="background-color: #10b981; color: white; padding: 6px 10px; border-radius: 9999px; font-weight: bold; font-size: 11px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">🟢 ${pickupLocation || "Pickup Location"}</div>`,
        iconSize: [140, 32],
        iconAnchor: [70, 16],
      });

      const mandiIcon = L.divIcon({
        className: "custom-mandi-pin",
        html: `<div style="background-color: #0284c7; color: white; padding: 6px 10px; border-radius: 9999px; font-weight: bold; font-size: 11px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">🏢 ${destinationMandi || "Destination Mandi"}</div>`,
        iconSize: [150, 32],
        iconAnchor: [75, 16],
      });

      // Add Markers
      const pMarker = L.marker(pickupCoords, { icon: pickupIcon }).addTo(map);
      pMarker.bindPopup(`<b>Starting Pickup Location</b><br/>${pickupLocation || "Aligarh"}`);

      const mMarker = L.marker(mandiCoords, { icon: mandiIcon }).addTo(map);
      mMarker.bindPopup(`<b>Destination Mandi</b><br/>${destinationMandi || "Agra Central Mandi"}`);

      // Draw Polyline Route
      const routePolyline = L.polyline([pickupCoords, mandiCoords], {
        color: driverView ? "#d97706" : "#10b981",
        weight: 5,
        opacity: 0.85,
        dashArray: "8, 8",
      }).addTo(map);

      map.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });

      // Click on Map to Select Pickup Location
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        if (onSelectPickupLocation) {
          onSelectPickupLocation(`Selected Point (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
        }
      });
    });

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [pickupLocation, destinationMandi]);

  return (
    <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden space-y-3">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/30 px-5 py-3.5 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <Navigation className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-foreground">Real-Time Route & Mandi GPS Mapper</h4>
            <p className="text-[10px] text-muted-foreground">
              {pickupLocation || "Starting Spot"} &rarr; {destinationMandi || "Target Mandi"} ({distanceKm} km)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600">
            Route: {distanceKm} km (~{Math.ceil(distanceKm / 40)} hrs)
          </span>
        </div>
      </div>

      {/* Map Element */}
      <div ref={mapContainerRef} style={{ height }} className="w-full bg-muted/20" />

      {/* Bottom Route Details */}
      <div className="grid grid-cols-2 gap-2 border-t border-border bg-card p-3 text-center md:grid-cols-4">
        <div>
          <span className="text-[10px] text-muted-foreground block">Pickup Origin</span>
          <span className="text-xs font-bold text-foreground truncate block">{pickupLocation || "Aligarh Hub"}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block">Target Mandi</span>
          <span className="text-xs font-bold text-foreground truncate block">{destinationMandi || "Agra Mandi"}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block">Route Distance</span>
          <span className="text-xs font-black text-brand block">{distanceKm} km</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block">Est. Freight Fare</span>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">₹{Math.round(distanceKm * 25)}</span>
        </div>
      </div>
    </div>
  );
}

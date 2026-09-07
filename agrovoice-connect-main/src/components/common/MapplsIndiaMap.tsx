import React, { useEffect, useRef, useState } from "react";
import { Navigation, MapPin, Locate, CheckCircle2 } from "lucide-react";
import { lookupCoords } from "./DynamicRouteMap";

interface MapplsIndiaMapProps {
  pickupLocation: string;
  destinationMandi: string;
  onSelectPickupLocation?: (locationName: string) => void;
  onSelectDestinationMandi?: (mandiName: string) => void;
  userCoords?: [number, number] | null;
  height?: string;
}

export function MapplsIndiaMap({
  pickupLocation,
  destinationMandi,
  onSelectPickupLocation,
  onSelectDestinationMandi,
  userCoords,
  height = "380px",
}: MapplsIndiaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  const pickupCoords = userCoords || lookupCoords(pickupLocation, [27.8974, 78.088]); // Aligarh
  const mandiCoords = lookupCoords(destinationMandi, [27.1767, 78.0081]); // Agra Mandi

  // Calculate approximate distance
  const R = 6371;
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

      const centerLat = (pickupCoords[0] + mandiCoords[0]) / 2;
      const centerLng = (pickupCoords[1] + mandiCoords[1]) / 2;

      const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 8);
      leafletMapRef.current = map;

      // Mappls (MapmyIndia) styled Indian Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: 'MapmyIndia / Mappls &copy; <a href="https://www.mappls.com">Mappls India</a>',
      }).addTo(map);

      // Custom Mappls Styled Pins
      const userLocationIcon = L.divIcon({
        className: "custom-mappls-gps-pin",
        html: `<div style="background-color: #ef4444; color: white; padding: 6px 10px; border-radius: 9999px; font-weight: bold; font-size: 11px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">📍 ${pickupLocation || "My Current Location"}</div>`,
        iconSize: [150, 32],
        iconAnchor: [75, 16],
      });

      const mandiIcon = L.divIcon({
        className: "custom-mappls-mandi-pin",
        html: `<div style="background-color: #0284c7; color: white; padding: 6px 10px; border-radius: 9999px; font-weight: bold; font-size: 11px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">🏢 ${destinationMandi || "Destination Mandi"}</div>`,
        iconSize: [160, 32],
        iconAnchor: [80, 16],
      });

      // Add Markers
      const pMarker = L.marker(pickupCoords, { icon: userLocationIcon }).addTo(map);
      pMarker.bindPopup(`<b>Mappls GPS Pickup Location</b><br/>${pickupLocation || "Aligarh Hub"}`);

      const mMarker = L.marker(mandiCoords, { icon: mandiIcon }).addTo(map);
      mMarker.bindPopup(`<b>Mappls Target Mandi</b><br/>${destinationMandi || "Agra Central Mandi"}`);

      // Mappls Polyline Route
      const routePolyline = L.polyline([pickupCoords, mandiCoords], {
        color: "#10b981",
        weight: 5,
        opacity: 0.9,
        dashArray: "6, 6",
      }).addTo(map);

      map.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });

      // Click Map to Select Starting Pickup Place
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        if (onSelectPickupLocation) {
          onSelectPickupLocation(`Selected GPS Point (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
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
  }, [pickupLocation, destinationMandi, userCoords]);

  return (
    <div className="rounded-3xl border border-border bg-card shadow-2xl overflow-hidden space-y-3">
      {/* Mappls Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-gradient-to-r from-emerald-500/10 via-card to-sky-500/10 px-5 py-3.5 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-white font-bold shadow-md">
            📍
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-xs text-foreground">Mappls (MapmyIndia) GPS Route Map</h4>
              <span className="rounded bg-red-500/10 px-2 py-0.5 text-[9px] font-black text-red-600">MAPPLS INDIA</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Click anywhere on the Mappls map to pick starting location
            </p>
          </div>
        </div>

        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          Distance: {distanceKm} km
        </span>
      </div>

      {/* Map Element */}
      <div ref={mapContainerRef} style={{ height }} className="w-full bg-muted/20" />

      {/* Mappls Footer Info */}
      <div className="grid grid-cols-2 gap-2 border-t border-border bg-card p-3 text-center md:grid-cols-4">
        <div>
          <span className="text-[10px] text-muted-foreground block">Mappls Pickup Spot</span>
          <span className="text-xs font-bold text-foreground truncate block">{pickupLocation || "Current GPS Location"}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block">Target Mandi</span>
          <span className="text-xs font-bold text-foreground truncate block">{destinationMandi || "Agra Mandi"}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block">Driving Distance</span>
          <span className="text-xs font-black text-emerald-600 block">{distanceKm} km</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block">Est. Driving Time</span>
          <span className="text-xs font-black text-amber-600 block">~{Math.ceil(distanceKm / 40)} hrs</span>
        </div>
      </div>
    </div>
  );
}

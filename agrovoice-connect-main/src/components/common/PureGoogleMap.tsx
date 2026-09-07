import React, { useEffect, useRef, useState } from "react";
import { Navigation, MapPin, Locate, CheckCircle2, Search, Compass, Layers, RotateCcw, Plus, Sliders, Hand } from "lucide-react";
import { ALL_INDIA_MANDIS, lookupCoordsExtended } from "./GoogleIndiaMandiMap";

interface PureGoogleMapProps {
  pickupLocation: string;
  destinationMandi: string;
  onSelectPickupLocation?: (locationName: string) => void;
  onSelectDestinationMandi?: (mandiName: string) => void;
  userCoords?: [number, number] | null;
  height?: string;
  editable?: boolean;
}

export function PureGoogleMap({
  pickupLocation,
  destinationMandi,
  onSelectPickupLocation,
  onSelectDestinationMandi,
  userCoords,
  height = "480px",
  editable = true,
}: PureGoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapType, setMapType] = useState<"roadmap" | "satellite" | "terrain">("roadmap");

  // Dynamic Draggable Coords State
  const [draggedPickupCoords, setDraggedPickupCoords] = useState<[number, number] | null>(null);
  const [draggedMandiCoords, setDraggedMandiCoords] = useState<[number, number] | null>(null);

  const initialPickupCoords = userCoords || lookupCoordsExtended(pickupLocation, [27.8974, 78.0880]); // Aligarh
  const initialMandiCoords = lookupCoordsExtended(destinationMandi, [27.1767, 78.0081]); // Agra Mandi

  const activePickupCoords = draggedPickupCoords || initialPickupCoords;
  const activeMandiCoords = draggedMandiCoords || initialMandiCoords;

  // Calculate Distance & Fare
  const R = 6371;
  const dLat = ((activeMandiCoords[0] - activePickupCoords[0]) * Math.PI) / 180;
  const dLon = ((activeMandiCoords[1] - activePickupCoords[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((activePickupCoords[0] * Math.PI) / 180) *
      Math.cos((activeMandiCoords[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c) || 42;
  const estFare = Math.round(distanceKm * 25);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let isMounted = true;
    import("leaflet").then((L) => {
      if (!isMounted || !mapRef.current) return;

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

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const centerLat = (activePickupCoords[0] + activeMandiCoords[0]) / 2;
      const centerLng = (activePickupCoords[1] + activeMandiCoords[1]) / 2;

      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([centerLat, centerLng], 7);

      mapInstanceRef.current = map;

      // Layer Tile Selection
      let tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      if (mapType === "satellite") {
        tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      } else if (mapType === "terrain") {
        tileUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
      }

      L.tileLayer(tileUrl, {
        attribution: 'Google Maps Engine &copy; <a href="https://maps.google.com">Google Maps Platform</a>',
        maxZoom: 18,
      }).addTo(map);

      L.control.zoom({ position: "topright" }).addTo(map);

      // 1. Draggable Google Red Pickup Pin
      const pickupIconHtml = `
        <div style="background: linear-gradient(135deg, #ea4335, #c5221f); color: white; padding: 7px 14px; border-radius: 9999px; font-weight: 800; font-size: 11px; box-shadow: 0 6px 16px rgba(234, 67, 53, 0.5); border: 2.5px solid white; display: flex; align-items: center; gap: 6px; white-space: nowrap; cursor: grab;">
          <span>📍 Pickup: ${pickupLocation || "Selected Pickup Spot"} (DRAG ME)</span>
        </div>
      `;

      const googlePickupPin = L.divIcon({
        className: "google-pickup-pin-pure",
        html: pickupIconHtml,
        iconSize: [220, 36],
        iconAnchor: [110, 18],
      });

      const pMarker = L.marker(activePickupCoords, { icon: googlePickupPin, draggable: true }).addTo(map);
      pMarker.bindPopup(`<b>Google Maps Pickup Origin</b><br/>Drag pin anywhere on map to adjust exact pickup location.`);

      // Handle Pin Dragging for Pickup Location
      pMarker.on("dragend", (event: any) => {
        const { lat, lng } = event.target.getLatLng();
        setDraggedPickupCoords([lat, lng]);
        const locLabel = `📍 Dragged Spot (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
        if (onSelectPickupLocation) {
          onSelectPickupLocation(locLabel);
        }
      });

      // 2. Draggable Google Blue Mandi Pin
      const mandiIconHtml = `
        <div style="background: linear-gradient(135deg, #1a73e8, #0b57d0); color: white; padding: 7px 14px; border-radius: 9999px; font-weight: 800; font-size: 11px; box-shadow: 0 6px 16px rgba(26, 115, 232, 0.5); border: 2.5px solid white; display: flex; align-items: center; gap: 6px; white-space: nowrap; cursor: grab;">
          <span>🏢 Mandi: ${destinationMandi || "Target Mandi"} (DRAG ME)</span>
        </div>
      `;

      const googleMandiPin = L.divIcon({
        className: "google-mandi-pin-pure",
        html: mandiIconHtml,
        iconSize: [220, 36],
        iconAnchor: [110, 18],
      });

      const mMarker = L.marker(activeMandiCoords, { icon: googleMandiPin, draggable: true }).addTo(map);
      mMarker.bindPopup(`<b>Google Maps Target Mandi</b><br/>Drag pin anywhere on map to adjust destination Mandi spot.`);

      // Handle Pin Dragging for Mandi Spot
      mMarker.on("dragend", (event: any) => {
        const { lat, lng } = event.target.getLatLng();
        setDraggedMandiCoords([lat, lng]);
        const mandiLabel = `🏢 Dragged Mandi (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
        if (onSelectDestinationMandi) {
          onSelectDestinationMandi(mandiLabel);
        }
      });

      // 3. Render All-India Mandis Across States
      ALL_INDIA_MANDIS.forEach((mandi) => {
        const statePin = L.divIcon({
          className: "google-state-pin",
          html: `
            <div style="background-color: #34a853; color: white; padding: 5px 9px; border-radius: 9999px; font-weight: 700; font-size: 10px; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border: 1.5px solid white; cursor: pointer; white-space: nowrap;">
              🌾 ${mandi.name.split(" ")[0]} (${mandi.cropPriceKg})
            </div>
          `,
          iconSize: [110, 26],
          iconAnchor: [55, 13],
        });

        const mandiMarker = L.marker(mandi.coords, { icon: statePin }).addTo(map);
        mandiMarker.on("click", () => {
          setDraggedMandiCoords(mandi.coords);
          if (onSelectDestinationMandi) onSelectDestinationMandi(mandi.name);
        });
      });

      // 4. Google Maps Directions Polyline Route
      const routePolyline = L.polyline([activePickupCoords, activeMandiCoords], {
        color: "#4285f4",
        weight: 6,
        opacity: 0.9,
      }).addTo(map);

      map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });

      // Click Map to Select Starting Pickup Place
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        setDraggedPickupCoords([lat, lng]);
        if (onSelectPickupLocation) {
          onSelectPickupLocation(`Selected Point (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
        }
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [pickupLocation, destinationMandi, userCoords, mapType, draggedPickupCoords, draggedMandiCoords]);

  const handleRecenter = () => {
    setDraggedPickupCoords(null);
    setDraggedMandiCoords(null);
    if (mapInstanceRef.current) {
      const centerLat = (initialPickupCoords[0] + initialMandiCoords[0]) / 2;
      const centerLng = (initialPickupCoords[1] + initialMandiCoords[1]) / 2;
      mapInstanceRef.current.setView([centerLat, centerLng], 8);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl space-y-0">
      {/* Top Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-gradient-to-r from-blue-600/10 via-card to-emerald-600/10 px-5 py-3.5 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-500/25">
            🗺️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-foreground">Interactive Google Maps Platform</h3>
              <span className="rounded-full bg-blue-600/10 px-2.5 py-0.5 text-[10px] font-black text-blue-600 dark:text-blue-400 border border-blue-500/20">
                DRAG PINS TO ADJUST
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Hand className="h-3 w-3 text-amber-500 animate-pulse" /> Drag Red or Blue pins to modify exact pickup spot & Mandi
            </p>
          </div>
        </div>

        {/* Options to modify map (Style & Recenter) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border">
            <button
              type="button"
              onClick={() => setMapType("roadmap")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                mapType === "roadmap" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🗺️ Roadmap
            </button>
            <button
              type="button"
              onClick={() => setMapType("satellite")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                mapType === "satellite" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapType("terrain")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                mapType === "terrain" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ⛰️ Terrain
            </button>
          </div>

          <button
            type="button"
            onClick={handleRecenter}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted border border-border text-foreground hover:bg-muted/80 transition-colors"
            title="Reset Pins & Recenter Route"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} style={{ height }} className="w-full bg-muted/20 relative" />

      {/* Map Drag Details Footer */}
      <div className="grid grid-cols-2 gap-3 border-t border-border bg-card/90 p-4 text-center md:grid-cols-4 backdrop-blur">
        <div>
          <span className="text-[11px] font-bold text-muted-foreground block">Pickup Spot (Draggable)</span>
          <span className="text-xs font-black text-foreground truncate block mt-0.5">{pickupLocation || "Drag Red Pin"}</span>
        </div>
        <div>
          <span className="text-[11px] font-bold text-muted-foreground block">Destination Mandi (Draggable)</span>
          <span className="text-xs font-black text-foreground truncate block mt-0.5">{destinationMandi || "Drag Blue Pin"}</span>
        </div>
        <div>
          <span className="text-[11px] font-bold text-muted-foreground block">Route Distance</span>
          <span className="text-xs font-black text-blue-600 dark:text-blue-400 block mt-0.5">{distanceKm} km</span>
        </div>
        <div>
          <span className="text-[11px] font-bold text-muted-foreground block">Est. Freight Fare</span>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">₹{estFare}</span>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { MapPin, Building2, Search, PlusCircle, Check, Sparkles, Navigation } from "lucide-react";
import { ALL_INDIA_MANDIS, MandiItem } from "./GoogleIndiaMandiMap";

export const POPULAR_INDIAN_PICKUP_LOCATIONS = [
  { name: "Aligarh Central Hub", district: "Aligarh", state: "Uttar Pradesh", type: "Agri Logistics Hub" },
  { name: "Rampur Village", district: "Aligarh", state: "Uttar Pradesh", type: "Farmer Cluster" },
  { name: "Hathras Produce Market", district: "Hathras", state: "Uttar Pradesh", type: "Collection Yard" },
  { name: "Khurja Junction Spot", district: "Bulandshahr", state: "Uttar Pradesh", type: "Logistics Yard" },
  { name: "Bulandshahr Grain Hub", district: "Bulandshahr", state: "Uttar Pradesh", type: "Sub-Mandi" },
  { name: "Mathura Highway Spot", district: "Mathura", state: "Uttar Pradesh", type: "Truck Route Hub" },
  { name: "Meerut Produce Market", district: "Meerut", state: "Uttar Pradesh", type: "District Yard" },
  { name: "Moradabad Agri Yard", district: "Moradabad", state: "Uttar Pradesh", type: "Collection Hub" },
  { name: "Nashik Farm Cluster", district: "Nashik", state: "Maharashtra", type: "Grape/Onion Hub" },
  { name: "Pimpalgaon Village", district: "Nashik", state: "Maharashtra", type: "Farmer Cluster" },
  { name: "Guntur Rural Spot", district: "Guntur", state: "Andhra Pradesh", type: "Chilli Cluster" },
  { name: "Indore Rural Hub", district: "Indore", state: "Madhya Pradesh", type: "Soyabean Yard" },
  { name: "Jaipur Rural Yard", district: "Jaipur", state: "Rajasthan", type: "Grain Cluster" },
  { name: "Ludhiana Farm Hub", district: "Ludhiana", state: "Punjab", type: "Wheat Cluster" },
  { name: "Karnal Farm Spot", district: "Karnal", state: "Haryana", type: "Rice Cluster" },
];

interface LocationAutocompleteInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  type: "mandi" | "pickup";
  onAddNewCustom?: (newItem: string) => void;
}

export function LocationAutocompleteInput({
  label,
  placeholder,
  value,
  onChange,
  type,
  onAddNewCustom,
}: LocationAutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Mandis dynamically as user types
  const filteredMandis = ALL_INDIA_MANDIS.filter((m) => {
    if (!value) return true;
    const q = value.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q) ||
      m.state.toLowerCase().includes(q) ||
      m.cropPriceKg.toLowerCase().includes(q)
    );
  });

  // Filter Pickup Spots dynamically as user types
  const filteredPickups = POPULAR_INDIAN_PICKUP_LOCATIONS.filter((p) => {
    if (!value) return true;
    const q = value.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q)
    );
  });

  const handleSelectOption = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-1">
      {label && <label className="block text-xs font-extrabold text-foreground">{label}</label>}

      <div className="relative flex items-center">
        {type === "mandi" ? (
          <Building2 className="absolute left-3.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <MapPin className="absolute left-3.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        )}

        <input
          type="text"
          required
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm font-bold text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      {/* Floating Dynamic Autocomplete Suggestion Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 max-h-72 w-full overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl p-2 space-y-1 backdrop-blur-xl">
          {type === "mandi" && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-black uppercase text-muted-foreground tracking-wider flex items-center justify-between border-b border-border mb-1">
                <span>🏢 All-India Mandis ({filteredMandis.length})</span>
                <span className="text-emerald-600 font-bold">Live Price / kg</span>
              </div>

              {filteredMandis.map((mandi) => (
                <button
                  key={mandi.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent blur
                    handleSelectOption(mandi.name);
                  }}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-blue-500/10 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      🏢
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block group-hover:text-blue-600">
                        {mandi.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {mandi.city}, {mandi.state} &bull; {mandi.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-600 block">{mandi.cropPriceKg}</span>
                    <span className="text-[9px] text-muted-foreground font-semibold">Live Rate</span>
                  </div>
                </button>
              ))}

              {filteredMandis.length === 0 && value && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectOption(value);
                    if (onAddNewCustom) onAddNewCustom(value);
                  }}
                  className="w-full flex items-center gap-2 rounded-xl bg-blue-500/10 p-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all"
                >
                  <PlusCircle className="h-4 w-4" />
                  + Use "{value}" as Custom Target Mandi
                </button>
              )}
            </>
          )}

          {type === "pickup" && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-black uppercase text-muted-foreground tracking-wider border-b border-border mb-1">
                📍 Suggested Indian Villages & Pickup Hubs ({filteredPickups.length})
              </div>

              {filteredPickups.map((pickup, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectOption(pickup.name);
                  }}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-emerald-500/10 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      📍
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block group-hover:text-emerald-600">
                        {pickup.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {pickup.district}, {pickup.state}
                      </span>
                    </div>
                  </div>

                  <span className="rounded bg-muted px-2.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                    {pickup.type}
                  </span>
                </button>
              ))}

              {filteredPickups.length === 0 && value && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectOption(value);
                    if (onAddNewCustom) onAddNewCustom(value);
                  }}
                  className="w-full flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all"
                >
                  <PlusCircle className="h-4 w-4" />
                  + Use "{value}" as Custom Pickup Spot
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

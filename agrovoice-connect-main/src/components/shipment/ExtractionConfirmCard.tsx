import { useState } from "react";
import {
  Check,
  Pencil,
  Sparkles,
  Package,
  Scale,
  MapPin,
  Truck,
  Calendar,
  Clock,
  Phone,
  AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ExtractedShipment {
  produce_type: string;
  quantity_kg: number | string;
  pickup_village: string;
  pickup_district: string;
  destination_mandi: string;
  preferred_pickup_date: string;
  preferred_pickup_time_window: string;
  contact_phone: string;
  ai_confidence_score?: number;
}

type FieldKey = keyof Omit<ExtractedShipment, "ai_confidence_score">;

interface FieldDef {
  key: FieldKey;
  label: string;
  icon: LucideIcon;
  type?: "text" | "number" | "date";
  placeholder?: string;
}

const FIELDS: FieldDef[] = [
  { key: "produce_type", label: "Produce", icon: Package, placeholder: "e.g. Potato" },
  { key: "quantity_kg", label: "Quantity (kg)", icon: Scale, type: "number", placeholder: "5000" },
  { key: "pickup_village", label: "Pickup village", icon: MapPin, placeholder: "Village name" },
  { key: "pickup_district", label: "Pickup district", icon: MapPin, placeholder: "District" },
  { key: "destination_mandi", label: "Destination mandi", icon: Truck, placeholder: "Mandi name" },
  { key: "preferred_pickup_date", label: "Pickup date", icon: Calendar, type: "date" },
  { key: "preferred_pickup_time_window", label: "Time window", icon: Clock, placeholder: "Morning" },
  { key: "contact_phone", label: "Contact", icon: Phone, placeholder: "+91…" },
];

interface Props {
  extracted: ExtractedShipment;
  onConfirm: (values: ExtractedShipment) => void;
  onEditAll?: (values: ExtractedShipment) => void;
  isSubmitting?: boolean;
}

export function ExtractionConfirmCard({
  extracted,
  onConfirm,
  onEditAll,
  isSubmitting,
}: Props) {
  const [values, setValues] = useState<ExtractedShipment>(extracted);
  const [editingKey, setEditingKey] = useState<FieldKey | null>(null);

  const confidence = values.ai_confidence_score ?? 0.85;
  const confidenceLevel: "high" | "medium" | "low" =
    confidence >= 0.8 ? "high" : confidence >= 0.6 ? "medium" : "low";

  const setField = (key: FieldKey, v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-muted">
            <Sparkles className="h-4 w-4 text-brand" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              We heard this from your recording
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Review the details, tap the pencil to fix anything, then confirm.
            </p>
          </div>
        </div>
        <ConfidenceBadge level={confidenceLevel} value={confidence} />
      </header>

      <ul className="divide-y divide-border">
        {FIELDS.map((f) => {
          const Icon = f.icon;
          const isEditing = editingKey === f.key;
          const raw = values[f.key];
          const value = raw === undefined || raw === null ? "" : String(raw);
          const empty = value.trim().length === 0;

          return (
            <li
              key={f.key}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-3.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {f.label}
                </p>
                {isEditing ? (
                  <input
                    autoFocus
                    type={f.type ?? "text"}
                    value={value}
                    placeholder={f.placeholder}
                    onChange={(e) => setField(f.key, e.target.value)}
                    onBlur={() => setEditingKey(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Escape") {
                        setEditingKey(null);
                      }
                    }}
                    className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                ) : (
                  <p
                    className={
                      empty
                        ? "mt-1 text-sm italic text-destructive"
                        : "mt-1 truncate text-sm font-medium text-foreground"
                    }
                  >
                    {empty ? "Missing — tap edit" : value}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setEditingKey(isEditing ? null : f.key)}
                aria-label={`Edit ${f.label}`}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-brand"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </li>
          );
        })}
      </ul>

      <footer className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
        {onEditAll && (
          <button
            type="button"
            onClick={() => onEditAll(values)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Pencil className="h-4 w-4" />
            Edit all
          </button>
        )}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onConfirm(values)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm shadow-brand/25 transition-transform hover:scale-[1.01] disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          {isSubmitting ? "Finding drivers…" : "Confirm & find drivers"}
        </button>
      </footer>
    </div>
  );
}

function ConfidenceBadge({
  level,
  value,
}: {
  level: "high" | "medium" | "low";
  value: number;
}) {
  const styles = {
    high: "bg-status-confirmed/15 text-status-confirmed",
    medium: "bg-status-pending/15 text-status-pending",
    low: "bg-status-cancelled/15 text-status-cancelled",
  }[level];

  const label = level === "high" ? "High confidence" : level === "medium" ? "Check carefully" : "Low confidence";
  const Icon = level === "low" ? AlertTriangle : Sparkles;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${styles}`}
      title={`AI confidence: ${Math.round(value * 100)}%`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

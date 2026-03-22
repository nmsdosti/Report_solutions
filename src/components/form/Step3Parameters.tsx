import { Report } from "@/types/report";

interface Step3Props {
  data: Partial<Report>;
  onChange: (field: keyof Report, value: string | number) => void;
}

const commonFields = [
  { key: "trialWeight", label: "TRIAL WEIGHT", unit: "g", placeholder: "55" },
  { key: "trialAngle", label: "TRIAL ANGLE", unit: "°", placeholder: "90" },
  { key: "rpm", label: "OPERATING SPEED", unit: "RPM", placeholder: "1450" },
];

const plane1Fields = [
  { key: "finalCorrectionWeight", label: "PLANE 1 — CORRECTION WEIGHT", unit: "g", placeholder: "55" },
  { key: "finalAngle", label: "PLANE 1 — ADDING ANGLE", unit: "°", placeholder: "115" },
];

const plane2Fields = [
  { key: "finalCorrectionWeight2", label: "PLANE 2 — CORRECTION WEIGHT", unit: "g", placeholder: "32" },
  { key: "finalAngle2", label: "PLANE 2 — ADDING ANGLE", unit: "°", placeholder: "240" },
];

export default function Step3Parameters({ data, onChange }: Step3Props) {
  const isDual = data.balancingMethod === "dual";

  const renderField = ({ key, label, unit, placeholder }: { key: string; label: string; unit: string; placeholder: string }) => (
    <div key={key}>
      <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={(data as Record<string, number | string>)[key] || ""}
          onChange={(e) =>
            onChange(key as keyof Report, parseFloat(e.target.value) || 0)
          }
          placeholder={placeholder}
          step="0.1"
          min="0"
          className="w-full bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-4 py-2.5 pr-16 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors placeholder-[#2A4A6A]"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A6B8A] text-xs font-mono font-semibold">
          {unit}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Common fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {commonFields.map(renderField)}
        <div>
          <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-1.5">
            REFERENCE POINT
          </label>
          <input
            type="text"
            value={data.referencePoint || ""}
            onChange={(e) => onChange("referencePoint", e.target.value)}
            placeholder="e.g. Shaft Keyway"
            className="w-full bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors placeholder-[#2A4A6A]"
          />
        </div>
      </div>

      {/* Plane 1 Correction */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#00C9A7]" />
          <span className="text-[#00C9A7] text-xs font-bold tracking-wider">
            {isDual ? "PLANE 1 — CORRECTION" : "CORRECTION DETAILS"}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plane1Fields.map((f) => renderField({
            ...f,
            label: isDual ? f.label : f.label.replace("PLANE 1 — ", ""),
          }))}
        </div>
      </div>

      {/* Plane 2 Correction (Dual plane only) */}
      {isDual && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#1E90FF]" />
            <span className="text-[#1E90FF] text-xs font-bold tracking-wider">PLANE 2 — CORRECTION</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plane2Fields.map(renderField)}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {(data.finalCorrectionWeight || 0) > 0 && (
        <div className={`grid gap-3 mt-2 ${isDual ? "grid-cols-2 sm:grid-cols-5" : "grid-cols-2 sm:grid-cols-3"}`}>
          <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-4 text-center">
            <div className="text-[#4A6B8A] text-[10px] font-semibold tracking-wider mb-1">
              {isDual ? "P1 WEIGHT" : "CORRECTION WEIGHT"}
            </div>
            <div className="text-[#00C9A7] text-2xl font-black font-mono">{data.finalCorrectionWeight || 0}</div>
            <div className="text-[#2A4A6A] text-xs">grams</div>
          </div>
          <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-4 text-center">
            <div className="text-[#4A6B8A] text-[10px] font-semibold tracking-wider mb-1">
              {isDual ? "P1 ANGLE" : "ADDING ANGLE"}
            </div>
            <div className="text-[#1E90FF] text-2xl font-black font-mono">{data.finalAngle || 0}°</div>
            <div className="text-[#2A4A6A] text-xs">degrees</div>
          </div>
          {isDual && (
            <>
              <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-4 text-center">
                <div className="text-[#4A6B8A] text-[10px] font-semibold tracking-wider mb-1">P2 WEIGHT</div>
                <div className="text-[#00C9A7] text-2xl font-black font-mono">{data.finalCorrectionWeight2 || 0}</div>
                <div className="text-[#2A4A6A] text-xs">grams</div>
              </div>
              <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-4 text-center">
                <div className="text-[#4A6B8A] text-[10px] font-semibold tracking-wider mb-1">P2 ANGLE</div>
                <div className="text-[#1E90FF] text-2xl font-black font-mono">{data.finalAngle2 || 0}°</div>
                <div className="text-[#2A4A6A] text-xs">degrees</div>
              </div>
            </>
          )}
          <div className={`bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-4 text-center ${isDual ? "" : "col-span-2 sm:col-span-1"}`}>
            <div className="text-[#4A6B8A] text-[10px] font-semibold tracking-wider mb-1">OPERATING SPEED</div>
            <div className="text-white text-2xl font-black font-mono">{data.rpm || 0}</div>
            <div className="text-[#2A4A6A] text-xs">RPM</div>
          </div>
        </div>
      )}
    </div>
  );
}

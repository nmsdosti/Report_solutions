import { Wind, Gauge, Zap, Droplets } from "lucide-react";
import { Report } from "@/types/report";

interface Step1Props {
  data: Partial<Report>;
  onChange: (field: keyof Report, value: string) => void;
}

const machineTypes = [
  { value: "fan", label: "Fan", icon: Wind },
  { value: "blower", label: "Blower", icon: Gauge },
  { value: "motor", label: "Motor", icon: Zap },
  { value: "pump", label: "Pump", icon: Droplets },
];

export default function Step1Equipment({ data, onChange }: Step1Props) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-1.5">
            EQUIPMENT NAME *
          </label>
          <input
            type="text"
            value={data.equipmentName || ""}
            onChange={(e) => onChange("equipmentName", e.target.value)}
            placeholder="e.g. Exhaust Fan EF-01"
            className="w-full bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors placeholder-[#2A4A6A]"
          />
        </div>
        <div>
          <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-1.5">
            EQUIPMENT ID / TAG
          </label>
          <input
            type="text"
            value={data.equipmentId || ""}
            onChange={(e) => onChange("equipmentId", e.target.value)}
            placeholder="e.g. TAG-2024-001"
            className="w-full bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors placeholder-[#2A4A6A]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-1.5">
            LOCATION / PLANT
          </label>
          <input
            type="text"
            value={data.location || ""}
            onChange={(e) => onChange("location", e.target.value)}
            placeholder="e.g. Plant A, Unit 3"
            className="w-full bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors placeholder-[#2A4A6A]"
          />
        </div>
        <div>
          <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-1.5">
            CUSTOMER NAME
          </label>
          <input
            type="text"
            value={data.customerName || ""}
            onChange={(e) => onChange("customerName", e.target.value)}
            placeholder="e.g. ABC Industries Ltd"
            className="w-full bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors placeholder-[#2A4A6A]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-1.5">
            BALANCING DATE
          </label>
          <input
            type="date"
            value={data.balancingDate || ""}
            onChange={(e) => onChange("balancingDate", e.target.value)}
            className="w-full bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-1.5">
            TECHNICIAN NAME
          </label>
          <input
            type="text"
            value={data.technicianName || ""}
            onChange={(e) => onChange("technicianName", e.target.value)}
            placeholder="e.g. John Engineer"
            className="w-full bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors placeholder-[#2A4A6A]"
          />
        </div>
      </div>

      {/* Machine Type */}
      <div>
        <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-3">
          MACHINE TYPE
        </label>
        <div className="grid grid-cols-4 gap-3">
          {machineTypes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onChange("machineType", value)}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                data.machineType === value
                  ? "bg-[#00C9A7]/10 border-[#00C9A7] text-[#00C9A7]"
                  : "bg-[#0D1B2A] border-[#1E3A5F] text-[#4A6B8A] hover:border-[#2A5A8A] hover:text-[#8BA8C4]"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Balancing Method */}
      <div>
        <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-3">
          BALANCING METHOD
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "single", label: "Single Plane", desc: "One correction plane" },
            { value: "dual", label: "Dual Plane", desc: "Two correction planes" },
          ].map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => onChange("balancingMethod", value)}
              className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left ${
                data.balancingMethod === value
                  ? "bg-[#1E90FF]/10 border-[#1E90FF] text-white"
                  : "bg-[#0D1B2A] border-[#1E3A5F] text-[#4A6B8A] hover:border-[#2A5A8A]"
              }`}
            >
              <div className={`font-bold text-sm mb-0.5 ${data.balancingMethod === value ? "text-[#1E90FF]" : ""}`}>
                {label}
              </div>
              <div className="text-xs opacity-70">{desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

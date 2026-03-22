import { Report } from "@/types/report";

interface Step5Props {
  data: Partial<Report>;
  onChange: (field: keyof Report, value: string) => void;
}

export default function Step5Notes({ data, onChange }: Step5Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-1.5">
          SERVICE REMARKS
        </label>
        <textarea
          value={data.serviceRemarks || ""}
          onChange={(e) => onChange("serviceRemarks", e.target.value)}
          placeholder="Describe the service performed, observations, and findings..."
          rows={3}
          className="w-full bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors placeholder-[#2A4A6A] resize-none"
        />
      </div>

      <div>
        <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-1.5">
          RECOMMENDATIONS
        </label>
        <textarea
          value={data.recommendations || ""}
          onChange={(e) => onChange("recommendations", e.target.value)}
          placeholder="Maintenance recommendations, next service intervals, spare parts..."
          rows={3}
          className="w-full bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors placeholder-[#2A4A6A] resize-none"
        />
      </div>

      {/* Status Selector */}
      <div>
        <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-3">
          REPORT STATUS
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "completed", label: "COMPLETED", color: "border-green-500 bg-green-500/10 text-green-400" },
            { value: "pending", label: "PENDING", color: "border-amber-500 bg-amber-500/10 text-amber-400" },
          ].map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => onChange("status", value)}
              className={`py-3 rounded-xl border font-bold text-sm tracking-wider transition-all ${
                data.status === value
                  ? color
                  : "bg-[#0D1B2A] border-[#1E3A5F] text-[#4A6B8A] hover:border-[#2A5A8A]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Acknowledgment */}
      <div>
        <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-1.5">
          CUSTOMER ACKNOWLEDGMENT NAME
        </label>
        <input
          type="text"
          value={data.customerAcknowledgment || ""}
          onChange={(e) => onChange("customerAcknowledgment", e.target.value)}
          placeholder="Customer representative name"
          className="w-full bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors placeholder-[#2A4A6A]"
        />
      </div>
    </div>
  );
}

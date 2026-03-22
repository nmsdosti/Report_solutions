import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Zap,
  Droplets,
  Wind,
  Gauge,
  Settings,
  Cpu,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { AlignmentReport, AlignmentEquipmentType } from "@/types/report";

interface AlignmentFormProps {
  existingReport?: AlignmentReport | null;
  onClose: () => void;
  onSave: (report: AlignmentReport) => void;
  onGeneratePDF: (report: AlignmentReport) => void;
}

const EQUIPMENT_OPTIONS: {
  type: AlignmentEquipmentType;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { type: "motor", label: "Motor", icon: Zap, color: "#F59E0B" },
  { type: "pump", label: "Pump", icon: Droplets, color: "#A78BFA" },
  { type: "fan", label: "Fan", icon: Wind, color: "#00C9A7" },
  { type: "blower", label: "Blower", icon: Gauge, color: "#1E90FF" },
  { type: "gearbox", label: "Gearbox", icon: Settings, color: "#F87171" },
  { type: "compressor", label: "Compressor", icon: Cpu, color: "#34D399" },
  { type: "other", label: "Other", icon: HelpCircle, color: "#9CA3AF" },
];

const ALIGNMENT_METHODS = [
  { value: "laser", label: "Laser Alignment" },
  { value: "dial_indicator", label: "Dial Indicator" },
  { value: "reverse_dial", label: "Reverse Dial" },
  { value: "optical", label: "Optical" },
];

function generateCaseId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `ALR-${date}-${rand}`;
}

const defaultMeasurement = {
  angularVertical: 0,
  angularHorizontal: 0,
  offsetVertical: 0,
  offsetHorizontal: 0,
};

function createEmptyReport(): AlignmentReport {
  return {
    id: crypto.randomUUID(),
    caseId: generateCaseId(),
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    driverType: "motor",
    drivenType: "pump",
    driverName: "Motor",
    drivenName: "Pump",
    projectName: "",
    equipmentTag: "",
    location: "",
    customerName: "",
    alignmentDate: new Date().toISOString().slice(0, 10),
    technicianName: "",
    alignmentMethod: "laser",
    before: { ...defaultMeasurement },
    after: { ...defaultMeasurement },
    toleranceOffsetMax: 0.05,
    toleranceAngleMax: 0.03,
    angularTolerance: 0.03,
    offsetTolerance: 0.05,
    serviceRemarks: "",
    recommendations: "",
    approvedBy: "",
    customerAcknowledgment: "",
    rpm: 1500,
    couplingType: "",
    shimAdded: "",
  };
}

const STEPS = [
  "Equipment Selection",
  "Job Details",
  "Before Measurements",
  "After Measurements",
  "Notes & Sign-off",
];

function MeasurementInput({
  label,
  value,
  onChange,
  unit = "mm",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-[#6B8BA4] mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          step="0.01"
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-[#0D1B2A] border border-[#1E3A5F] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00C9A7] pr-14"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
          placeholder="0.00"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#4A6580]">{unit}</span>
      </div>
    </div>
  );
}

function PassFailBadge({ pass }: { pass: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
        pass ? "bg-green-900/50 text-green-400 border border-green-700" : "bg-red-900/40 text-red-400 border border-red-700"
      }`}
    >
      {pass ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {pass ? "PASS" : "FAIL"}
    </span>
  );
}

export default function AlignmentForm({
  existingReport,
  onClose,
  onSave,
  onGeneratePDF,
}: AlignmentFormProps) {
  const [step, setStep] = useState(0);
  const [report, setReport] = useState<AlignmentReport>(
    existingReport ?? createEmptyReport()
  );

  const update = (partial: Partial<AlignmentReport>) => {
    setReport((r) => ({ ...r, ...partial, updatedAt: new Date().toISOString() }));
  };

  const updateBefore = (partial: Partial<typeof defaultMeasurement>) => {
    setReport((r) => ({ ...r, before: { ...r.before, ...partial } }));
  };

  const updateAfter = (partial: Partial<typeof defaultMeasurement>) => {
    setReport((r) => ({ ...r, after: { ...r.after, ...partial } }));
  };

  // Pass/fail checks
  const vertPassBefore =
    report.before.offsetVertical <= report.toleranceOffsetMax &&
    report.before.angularVertical <= report.toleranceAngleMax;
  const horizPassBefore =
    report.before.offsetHorizontal <= report.toleranceOffsetMax &&
    report.before.angularHorizontal <= report.toleranceAngleMax;
  const vertPassAfter =
    report.after.offsetVertical <= report.toleranceOffsetMax &&
    report.after.angularVertical <= report.toleranceAngleMax;
  const horizPassAfter =
    report.after.offsetHorizontal <= report.toleranceOffsetMax &&
    report.after.angularHorizontal <= report.toleranceAngleMax;

  const driverInfo = EQUIPMENT_OPTIONS.find((e) => e.type === report.driverType)!;
  const drivenInfo = EQUIPMENT_OPTIONS.find((e) => e.type === report.drivenType)!;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-8">
            {/* Driver Equipment */}
            <div>
              <h3 className="text-sm font-semibold text-[#00C9A7] uppercase tracking-widest mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Driver Equipment (Driving Machine)
              </h3>
              <p className="text-xs text-[#4A6580] mb-4">The equipment that provides power (e.g., Motor)</p>
              <div className="grid grid-cols-4 gap-3">
                {EQUIPMENT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = report.driverType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => update({ driverType: opt.type, driverName: opt.label })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                        selected
                          ? "border-[#00C9A7] bg-[#0D2820]"
                          : "border-[#1E3A5F] bg-[#0D1B2A] hover:border-[#2A4A6F]"
                      }`}
                    >
                      <Icon className="w-6 h-6" style={{ color: selected ? opt.color : "#4A6580" }} />
                      <span className="text-xs text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {report.driverType === "other" && (
                <input
                  type="text"
                  value={report.driverName === "Other" ? "" : report.driverName}
                  onChange={(e) => update({ driverName: e.target.value })}
                  placeholder="Specify driver equipment name..."
                  className="mt-3 w-full bg-[#0D1B2A] border border-[#1E3A5F] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00C9A7]"
                />
              )}
            </div>

            {/* Arrow indicator */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1 h-px bg-[#1E3A5F]" />
              <div className="flex items-center gap-3 text-[#4A6580] text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D1B2A] border border-[#1E3A5F]">
                  {driverInfo && <driverInfo.icon className="w-4 h-4" style={{ color: driverInfo.color }} />}
                  <span className="text-white text-xs">{report.driverName}</span>
                </div>
                <span className="text-[#00C9A7] text-lg">⟶</span>
                <span className="text-xs">Power Transfer</span>
                <span className="text-[#00C9A7] text-lg">⟶</span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D1B2A] border border-[#1E3A5F]">
                  {drivenInfo && <drivenInfo.icon className="w-4 h-4" style={{ color: drivenInfo.color }} />}
                  <span className="text-white text-xs">{report.drivenName}</span>
                </div>
              </div>
              <div className="flex-1 h-px bg-[#1E3A5F]" />
            </div>

            {/* Driven Equipment */}
            <div>
              <h3 className="text-sm font-semibold text-[#1E90FF] uppercase tracking-widest mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Driven Equipment (Receiving Machine)
              </h3>
              <p className="text-xs text-[#4A6580] mb-4">The equipment being driven (e.g., Pump, Fan)</p>
              <div className="grid grid-cols-4 gap-3">
                {EQUIPMENT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = report.drivenType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => update({ drivenType: opt.type, drivenName: opt.label })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                        selected
                          ? "border-[#1E90FF] bg-[#091828]"
                          : "border-[#1E3A5F] bg-[#0D1B2A] hover:border-[#2A4A6F]"
                      }`}
                    >
                      <Icon className="w-6 h-6" style={{ color: selected ? opt.color : "#4A6580" }} />
                      <span className="text-xs text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {report.drivenType === "other" && (
                <input
                  type="text"
                  value={report.drivenName === "Other" ? "" : report.drivenName}
                  onChange={(e) => update({ drivenName: e.target.value })}
                  placeholder="Specify driven equipment name..."
                  className="mt-3 w-full bg-[#0D1B2A] border border-[#1E3A5F] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1E90FF]"
                />
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Project / Work Order Name", key: "projectName", placeholder: "BP-1044 / Boiler Feed Pump" },
                { label: "Equipment Tag / ID", key: "equipmentTag", placeholder: "P-102A" },
                { label: "Location / Plant", key: "location", placeholder: "Facility 7 - Plant 2B" },
                { label: "Customer Name", key: "customerName", placeholder: "Client Company" },
                { label: "Technician Name", key: "technicianName", placeholder: "J. Sharma" },
                { label: "RPM", key: "rpm", placeholder: "1500", type: "number" },
                { label: "Coupling Type", key: "couplingType", placeholder: "Flexible Jaw" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-[#6B8BA4] mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type || "text"}
                    value={(report as any)[field.key] || ""}
                    onChange={(e) =>
                      update({ [field.key]: field.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value } as any)
                    }
                    placeholder={field.placeholder}
                    className="w-full bg-[#0D1B2A] border border-[#1E3A5F] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00C9A7]"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#6B8BA4] mb-1">Alignment Date</label>
                <input
                  type="date"
                  value={report.alignmentDate}
                  onChange={(e) => update({ alignmentDate: e.target.value })}
                  className="w-full bg-[#0D1B2A] border border-[#1E3A5F] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00C9A7]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B8BA4] mb-1">Alignment Method</label>
                <select
                  value={report.alignmentMethod}
                  onChange={(e) => update({ alignmentMethod: e.target.value as any })}
                  className="w-full bg-[#0D1B2A] border border-[#1E3A5F] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00C9A7]"
                >
                  {ALIGNMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1E3A5F]">
              <h4 className="text-xs font-semibold text-[#00C9A7] uppercase tracking-widest mb-3">Alignment Tolerances</h4>
              <div className="grid grid-cols-2 gap-4">
                <MeasurementInput
                  label="Max Offset Tolerance (mm)"
                  value={report.toleranceOffsetMax}
                  onChange={(v) => update({ toleranceOffsetMax: v })}
                />
                <MeasurementInput
                  label="Max Angular Tolerance (mm/100mm)"
                  value={report.toleranceAngleMax}
                  onChange={(v) => update({ toleranceAngleMax: v })}
                  unit="mm/100"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-700/40">
              <p className="text-xs text-amber-400 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                📋 Record the initial misalignment readings BEFORE any corrections are made
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Angular Misalignment */}
              <div className="p-5 rounded-xl bg-[#0D1B2A] border border-[#1E3A5F]">
                <h4 className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
                  Angular Misalignment
                </h4>
                <p className="text-xs text-[#4A6580] mb-4">Units: mm/100mm</p>
                <div className="space-y-3">
                  <MeasurementInput
                    label="Vertical Angular"
                    value={report.before.angularVertical}
                    onChange={(v) => updateBefore({ angularVertical: v })}
                    unit="mm/100"
                  />
                  <MeasurementInput
                    label="Horizontal Angular"
                    value={report.before.angularHorizontal}
                    onChange={(v) => updateBefore({ angularHorizontal: v })}
                    unit="mm/100"
                  />
                </div>
              </div>

              {/* Offset Misalignment */}
              <div className="p-5 rounded-xl bg-[#0D1B2A] border border-[#1E3A5F]">
                <h4 className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
                  Offset Misalignment
                </h4>
                <p className="text-xs text-[#4A6580] mb-4">Units: mm</p>
                <div className="space-y-3">
                  <MeasurementInput
                    label="Vertical Offset"
                    value={report.before.offsetVertical}
                    onChange={(v) => updateBefore({ offsetVertical: v })}
                  />
                  <MeasurementInput
                    label="Horizontal Offset"
                    value={report.before.offsetHorizontal}
                    onChange={(v) => updateBefore({ offsetHorizontal: v })}
                  />
                </div>
              </div>
            </div>

            {/* Live Status */}
            <div className="p-4 rounded-xl bg-[#0D1B2A] border border-[#1E3A5F]">
              <h4 className="text-xs font-semibold text-[#6B8BA4] uppercase tracking-widest mb-3">Initial Status</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6B8BA4]">Vertical</span>
                  <PassFailBadge pass={vertPassBefore} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6B8BA4]">Horizontal</span>
                  <PassFailBadge pass={horizPassBefore} />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-green-900/20 border border-green-700/40">
              <p className="text-xs text-green-400 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                ✅ Record the final measurements AFTER all corrections, shim additions, and bolt torqueing
              </p>
            </div>

            <div>
              <label className="block text-xs text-[#6B8BA4] mb-1">Shim Added / Removed</label>
              <input
                type="text"
                value={report.shimAdded}
                onChange={(e) => update({ shimAdded: e.target.value })}
                placeholder="e.g. +0.15mm vertical rear feet"
                className="w-full bg-[#0D1B2A] border border-[#1E3A5F] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00C9A7]"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-[#0D1B2A] border border-[#1E3A5F]">
                <h4 className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
                  Angular Misalignment
                </h4>
                <p className="text-xs text-[#4A6580] mb-4">After correction (mm/100mm)</p>
                <div className="space-y-3">
                  <MeasurementInput
                    label="Vertical Angular"
                    value={report.after.angularVertical}
                    onChange={(v) => updateAfter({ angularVertical: v })}
                    unit="mm/100"
                  />
                  <MeasurementInput
                    label="Horizontal Angular"
                    value={report.after.angularHorizontal}
                    onChange={(v) => updateAfter({ angularHorizontal: v })}
                    unit="mm/100"
                  />
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0D1B2A] border border-[#1E3A5F]">
                <h4 className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
                  Offset Misalignment
                </h4>
                <p className="text-xs text-[#4A6580] mb-4">After correction (mm)</p>
                <div className="space-y-3">
                  <MeasurementInput
                    label="Vertical Offset"
                    value={report.after.offsetVertical}
                    onChange={(v) => updateAfter({ offsetVertical: v })}
                  />
                  <MeasurementInput
                    label="Horizontal Offset"
                    value={report.after.offsetHorizontal}
                    onChange={(v) => updateAfter({ offsetHorizontal: v })}
                  />
                </div>
              </div>
            </div>

            {/* Comparison Summary */}
            <div className="p-4 rounded-xl bg-[#0D1B2A] border border-[#1E3A5F]">
              <h4 className="text-xs font-semibold text-[#6B8BA4] uppercase tracking-widest mb-3">Final Status</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#4A6580] mb-1">Vertical</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#6B8BA4]">
                      Offset: {report.before.offsetVertical} → <span className="text-white font-mono">{report.after.offsetVertical}mm</span>
                    </span>
                    <PassFailBadge pass={vertPassAfter} />
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="text-[#6B8BA4]">
                      Angle: {report.before.angularVertical} → <span className="text-white font-mono">{report.after.angularVertical}mm/100</span>
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#4A6580] mb-1">Horizontal</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#6B8BA4]">
                      Offset: {report.before.offsetHorizontal} → <span className="text-white font-mono">{report.after.offsetHorizontal}mm</span>
                    </span>
                    <PassFailBadge pass={horizPassAfter} />
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="text-[#6B8BA4]">
                      Angle: {report.before.angularHorizontal} → <span className="text-white font-mono">{report.after.angularHorizontal}mm/100</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-[#6B8BA4] mb-1">Service Remarks</label>
                <textarea
                  value={report.serviceRemarks}
                  onChange={(e) => update({ serviceRemarks: e.target.value })}
                  rows={3}
                  placeholder="Describe the work performed, observations, and any issues found..."
                  className="w-full bg-[#0D1B2A] border border-[#1E3A5F] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00C9A7] resize-none"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-[#6B8BA4] mb-1">Recommendations</label>
                <textarea
                  value={report.recommendations}
                  onChange={(e) => update({ recommendations: e.target.value })}
                  rows={2}
                  placeholder="Future maintenance recommendations, follow-up actions..."
                  className="w-full bg-[#0D1B2A] border border-[#1E3A5F] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00C9A7] resize-none"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B8BA4] mb-1">Report Status</label>
                <select
                  value={report.status}
                  onChange={(e) => update({ status: e.target.value as any })}
                  className="w-full bg-[#0D1B2A] border border-[#1E3A5F] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00C9A7]"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex flex-col" style={{
      backgroundImage: `linear-gradient(rgba(0,201,167,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,201,167,0.02) 1px, transparent 1px)`,
      backgroundSize: "40px 40px",
    }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E3A5F] bg-[#112233]">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-[#6B8BA4] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg" style={{ fontFamily: "Syne, sans-serif" }}>
              Shaft Alignment Report
            </h1>
            <p className="text-xs font-mono text-[#00C9A7]">{report.caseId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[#6B8BA4]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            {driverInfo && <driverInfo.icon className="w-4 h-4" style={{ color: driverInfo.color }} />}
            <span className="text-white">{report.driverName}</span>
            <span className="text-[#1E90FF]">⟶</span>
            {drivenInfo && <drivenInfo.icon className="w-4 h-4" style={{ color: drivenInfo.color }} />}
            <span className="text-white">{report.drivenName}</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-[#1E3A5F]">
        <div className="flex items-center gap-1 max-w-3xl mx-auto">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 text-xs font-medium transition-all ${
                  i === step
                    ? "text-[#00C9A7]"
                    : i < step
                    ? "text-[#6B8BA4] cursor-pointer hover:text-white"
                    : "text-[#2A3A4F]"
                }`}
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                    i === step
                      ? "bg-[#00C9A7] border-[#00C9A7] text-[#0D1B2A]"
                      : i < step
                      ? "bg-[#1E3A5F] border-[#00C9A7] text-[#00C9A7]"
                      : "bg-transparent border-[#1E3A5F] text-[#2A3A4F]"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="hidden sm:block">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${i < step ? "bg-[#00C9A7]" : "bg-[#1E3A5F]"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "Syne, sans-serif" }}>
            {STEPS[step]}
          </h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="px-6 py-4 border-t border-[#1E3A5F] bg-[#112233] flex items-center justify-between">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : onClose()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#6B8BA4] hover:text-white transition-colors text-sm"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 0 ? "Cancel" : "Back"}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSave(report)}
            className="px-4 py-2 rounded-lg border border-[#1E3A5F] text-[#6B8BA4] hover:text-white hover:border-[#2A4A6F] transition-all text-sm"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Save & Exit
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#00C9A7] text-[#0D1B2A] font-semibold text-sm hover:bg-[#00b396] transition-colors"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onGeneratePDF(report)}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#1E90FF] text-white font-semibold text-sm hover:bg-[#1a7fe0] transition-colors"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Generate PDF
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

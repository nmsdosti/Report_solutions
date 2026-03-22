import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Save,
  FileText,
  Cloud,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Report, MeasurementPoint } from "@/types/report";
import { generateCaseId, storage } from "@/lib/storage";
import { dataService } from "@/lib/dataService";
import Step1Equipment from "./Step1Equipment";
import Step2Vibration from "./Step2Vibration";
import Step3Parameters from "./Step3Parameters";
import Step4Visualization from "./Step4Visualization";
import Step5Notes from "./Step5Notes";

interface ReportFormProps {
  existingReport?: Report | null;
  onClose: () => void;
  onSave: (report: Report) => void;
  onGeneratePDF: (report: Report) => void;
}

const STEPS = [
  { label: "Equipment", short: "1" },
  { label: "Vibration", short: "2" },
  { label: "Parameters", short: "3" },
  { label: "Visualization", short: "4" },
  { label: "Notes", short: "5" },
];

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function ReportForm({ existingReport, onClose, onSave, onGeneratePDF }: ReportFormProps) {
  const [step, setStep] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formData, setFormData] = useState<Partial<Report>>(() => {
    if (existingReport) return { ...existingReport };
    return {
      caseId: generateCaseId(),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      balancingDate: new Date().toISOString().split("T")[0],
      machineType: "fan",
      balancingMethod: "single",
      measurementPoints: [],
      trialWeight: 0,
      trialAngle: 0,
      finalCorrectionWeight: 0,
      finalAngle: 0,
      finalCorrectionWeight2: 0,
      finalAngle2: 0,
      rpm: 0,
    };
  });

  const autoSave = useCallback((data: Partial<Report>) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(async () => {
      try {
        const id = data.id || crypto.randomUUID();
        const updated = { ...data, id, updatedAt: new Date().toISOString() } as Report;
        await dataService.saveReport(updated);
        setFormData((prev) => ({ ...prev, id }));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    }, 800);
  }, []);

  const updateField = useCallback(
    (field: keyof Report, value: string | number) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value };
        autoSave(next);
        return next;
      });
    },
    [autoSave]
  );

  const updatePoints = useCallback(
    (points: MeasurementPoint[]) => {
      setFormData((prev) => {
        const next = { ...prev, measurementPoints: points };
        autoSave(next);
        return next;
      });
    },
    [autoSave]
  );

  const handleSaveAndExit = async () => {
    const id = formData.id || crypto.randomUUID();
    const report = { ...formData, id, updatedAt: new Date().toISOString() } as Report;
    await dataService.saveReport(report);
    onSave(report);
  };

  const handleGeneratePDF = async () => {
    const id = formData.id || crypto.randomUUID();
    const report = { ...formData, id, updatedAt: new Date().toISOString() } as Report;
    await dataService.saveReport(report);
    onGeneratePDF(report);
  };

  return (
    <div className="fixed inset-0 bg-[#0D1B2A]/95 z-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#162032] border-b border-[#1E3A5F] px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C9A7] to-[#1E90FF] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#0D1B2A]" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">
                {existingReport ? "Edit Report" : "New Report"}
              </div>
              <div className="text-[#00C9A7] text-[10px] font-mono tracking-wider">
                {formData.caseId}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Save status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              {saveStatus === "saving" && (
                <>
                  <span className="w-3 h-3 border border-[#4A6B8A] border-t-[#00C9A7] rounded-full animate-spin" />
                  <span className="text-[#4A6B8A]">Saving...</span>
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <Cloud className="w-3.5 h-3.5 text-[#00C9A7]" />
                  <span className="text-[#00C9A7]">Saved</span>
                </>
              )}
              {saveStatus === "error" && (
                <span className="text-red-400">Save failed</span>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#0D1B2A] border border-[#1E3A5F] flex items-center justify-center text-[#4A6B8A] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Step Progress */}
      <div className="bg-[#0D1B2A] border-b border-[#1E3A5F] px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <button
                  onClick={() => i <= step && setStep(i)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    i === step
                      ? "bg-[#00C9A7] text-[#0D1B2A]"
                      : i < step
                      ? "text-[#00C9A7] hover:bg-[#00C9A7]/10 cursor-pointer"
                      : "text-[#2A4A6A] cursor-default"
                  }`}
                >
                  {i < step ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      i === step ? "bg-[#0D1B2A]/20" : "bg-[#1E3A5F]"
                    }`}>
                      {s.short}
                    </span>
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 mx-1 transition-colors ${i < step ? "bg-[#00C9A7]/40" : "bg-[#1E3A5F]"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <Step1Equipment data={formData} onChange={updateField} />
              )}
              {step === 1 && (
                <Step2Vibration
                  points={formData.measurementPoints || []}
                  onChange={updatePoints}
                />
              )}
              {step === 2 && (
                <Step3Parameters data={formData} onChange={updateField} />
              )}
              {step === 3 && (
                <Step4Visualization
                  data={formData}
                  points={formData.measurementPoints || []}
                  onAngleChange={(a) => updateField("finalAngle", a)}
                  onAngle2Change={(a) => updateField("finalAngle2", a)}
                />
              )}
              {step === 4 && (
                <Step5Notes data={formData} onChange={updateField} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="bg-[#162032] border-t border-[#1E3A5F] px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D1B2A] border border-[#1E3A5F] text-[#8BA8C4] hover:text-white text-sm font-medium transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </button>

          <div className="flex items-center gap-2">
            {step === STEPS.length - 1 ? (
              <>
                <button
                  onClick={handleSaveAndExit}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D1B2A] border border-[#1E3A5F] text-[#8BA8C4] hover:text-white text-sm font-medium transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save & Exit
                </button>
                <button
                  onClick={handleGeneratePDF}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00C9A7] to-[#1E90FF] text-[#0D1B2A] font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <FileText className="w-4 h-4" />
                  Generate PDF
                </button>
              </>
            ) : (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00C9A7] to-[#1E90FF] text-[#0D1B2A] font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Upload, Eye, Save, Zap } from "lucide-react";
import { CompanyBranding } from "@/types/report";
import { storage } from "@/lib/storage";
import { toast } from "sonner";

interface SettingsPageProps {
  branding: CompanyBranding;
  onClose: () => void;
  onSave: (branding: CompanyBranding) => void;
}

export default function SettingsPage({ branding: initialBranding, onClose, onSave }: SettingsPageProps) {
  const [branding, setBranding] = useState<CompanyBranding>({ ...initialBranding });
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setBranding((prev) => ({ ...prev, logo: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleSave = () => {
    storage.saveBranding(branding);
    onSave(branding);
    toast.success("Branding settings saved!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0D1B2A]/95 z-50 flex flex-col">
      <header className="bg-[#162032] border-b border-[#1E3A5F] px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C9A7] to-[#1E90FF] flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#0D1B2A]" />
          </div>
          <h1 className="text-white font-bold">Company Branding Settings</h1>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-lg bg-[#0D1B2A] border border-[#1E3A5F] flex items-center justify-center text-[#4A6B8A] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Form */}
          <div className="space-y-5">
            <h2 className="text-[#8BA8C4] text-sm font-semibold tracking-wider">BRANDING DETAILS</h2>

            {/* Logo Upload */}
            <div>
              <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-2">
                COMPANY LOGO
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-[#00C9A7] bg-[#00C9A7]/5"
                    : "border-[#1E3A5F] hover:border-[#2A5A8A]"
                }`}
              >
                {branding.logo ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={branding.logo} alt="logo" className="h-16 object-contain" />
                    <p className="text-[#4A6B8A] text-xs">Click to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-[#2A4A6A]" />
                    <p className="text-[#4A6B8A] text-sm">Drag & drop or click to upload</p>
                    <p className="text-[#2A4A6A] text-xs">PNG, JPG, SVG</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
              {branding.logo && (
                <button
                  onClick={() => setBranding((prev) => ({ ...prev, logo: null }))}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove logo
                </button>
              )}
            </div>

            {[
              { key: "companyName", label: "COMPANY NAME", placeholder: "TechBal Solutions" },
              { key: "phone", label: "PHONE NUMBER", placeholder: "+91 123 456 8800" },
              { key: "email", label: "EMAIL ADDRESS", placeholder: "info@company.com" },
              { key: "website", label: "WEBSITE", placeholder: "www.company.com" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-1.5">
                  {label}
                </label>
                <input
                  type="text"
                  value={(branding as Record<string, string>)[key] || ""}
                  onChange={(e) => setBranding((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors placeholder-[#2A4A6A]"
                />
              </div>
            ))}
          </div>

          {/* Live Preview */}
          <div>
            <h2 className="text-[#8BA8C4] text-sm font-semibold tracking-wider mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              PDF HEADER / FOOTER PREVIEW
            </h2>

            {/* Header Preview */}
            <motion.div
              layout
              className="bg-[#F4F8FB] rounded-xl overflow-hidden border border-[#CBD5E1] shadow-lg"
            >
              <div className="p-4 border-b border-[#CBD5E1] flex items-center justify-between">
                <div>
                  {branding.logo ? (
                    <img src={branding.logo} alt="logo" className="h-10 object-contain mb-1" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00C9A7] to-[#1E90FF] flex items-center justify-center mb-1">
                      <span className="text-[#0D1B2A] font-black text-sm">TB</span>
                    </div>
                  )}
                  <div className="text-xs text-[#4A6B8A]">{branding.companyName}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-[#1a1a2e]">EQUIPMENT NAME</div>
                  <div className="text-xs font-bold text-[#00C9A7] tracking-widest">DYNAMIC BALANCING REPORT</div>
                  <div className="text-[10px] text-[#4A6B8A] font-mono mt-0.5">Case ID: DBR-20240101-001</div>
                </div>
              </div>

              {/* Footer Preview */}
              <div className="p-3 border-t border-[#0D1B2A] bg-[#F4F8FB] flex items-center justify-between">
                <div className="flex gap-3">
                  {["SMOOTH OPERATION", "SMOOTH RELIABILITY"].map((t) => (
                    <div key={t} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-[#00C9A7] flex items-center justify-center">
                        <span className="text-white text-[6px] font-bold">✓</span>
                      </div>
                      <span className="text-[7px] font-bold text-[#1a1a2e]">{t}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 text-[8px] text-[#4A6B8A]">
                  <span>📞 {branding.phone}</span>
                  <span>✉ {branding.email}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <footer className="bg-[#162032] border-t border-[#1E3A5F] px-6 py-4 flex justify-end gap-3 flex-shrink-0">
        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl bg-[#0D1B2A] border border-[#1E3A5F] text-[#8BA8C4] hover:text-white text-sm font-medium transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00C9A7] to-[#1E90FF] text-[#0D1B2A] font-bold text-sm hover:opacity-90 transition-all"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </footer>
    </div>
  );
}

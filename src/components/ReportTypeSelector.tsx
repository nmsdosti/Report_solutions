import { motion } from "framer-motion";
import { Activity, RotateCcw } from "lucide-react";

interface ReportTypeSelectorProps {
  onSelect: (type: "balancing" | "alignment") => void;
}

export default function ReportTypeSelector({
  onSelect,
}: ReportTypeSelectorProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background: "#0D1B2A",
        backgroundImage: `
          linear-gradient(rgba(0,201,167,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,201,167,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#00C9A7] flex items-center justify-center">
            <Activity className="w-6 h-6 text-[#0D1B2A]" />
          </div>
          <span
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            TechReport Pro
          </span>
        </div>
        <h1
          className="text-4xl font-extrabold text-white mb-3"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          What report would you like to create?
        </h1>
        <p className="text-[#6B8BA4] text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          Select the type of technical report to proceed
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-6">
        {/* Balancing Report */}
        <motion.button
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          whileHover={{ scale: 1.03, borderColor: "#00C9A7" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect("balancing")}
          className="group relative flex flex-col items-start p-8 rounded-2xl border border-[#1E3A5F] bg-[#162032] hover:border-[#00C9A7] transition-all text-left cursor-pointer"
          style={{ boxShadow: "0 0 0 0 #00C9A7" }}
        >
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-2 h-2 rounded-full bg-[#00C9A7] animate-pulse" />
          </div>

          <div className="w-16 h-16 rounded-xl bg-[#0D1B2A] border border-[#1E3A5F] flex items-center justify-center mb-5 group-hover:border-[#00C9A7] transition-colors">
            <RotateCcw className="w-8 h-8 text-[#00C9A7]" />
          </div>

          <h2
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Dynamic Balancing
          </h2>
          <p className="text-[#6B8BA4] text-sm leading-relaxed" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Record vibration measurements before & after balancing. Generate correction weights, angles, and vibration reduction charts.
          </p>

          <div className="mt-6 flex gap-2 flex-wrap">
            {["Fan", "Blower", "Motor", "Pump"].map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded text-xs font-medium bg-[#0D1B2A] text-[#00C9A7] border border-[#1E3A5F]"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 text-[#00C9A7] font-semibold text-sm">
            <span>Create Balancing Report</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </motion.button>

        {/* Alignment Report */}
        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          whileHover={{ scale: 1.03, borderColor: "#1E90FF" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect("alignment")}
          className="group relative flex flex-col items-start p-8 rounded-2xl border border-[#1E3A5F] bg-[#162032] hover:border-[#1E90FF] transition-all text-left cursor-pointer"
        >
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-2 h-2 rounded-full bg-[#1E90FF] animate-pulse" />
          </div>

          <div className="w-16 h-16 rounded-xl bg-[#0D1B2A] border border-[#1E3A5F] flex items-center justify-center mb-5 group-hover:border-[#1E90FF] transition-colors">
            <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
              <line x1="4" y1="16" x2="28" y2="16" stroke="#1E90FF" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="10" cy="16" r="3" stroke="#1E90FF" strokeWidth="2" />
              <circle cx="22" cy="16" r="3" stroke="#1E90FF" strokeWidth="2" />
              <line x1="10" y1="8" x2="10" y2="24" stroke="#1E90FF" strokeWidth="1.5" strokeDasharray="3,2" />
              <line x1="22" y1="8" x2="22" y2="24" stroke="#1E90FF" strokeWidth="1.5" strokeDasharray="3,2" />
            </svg>
          </div>

          <h2
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Shaft Alignment
          </h2>
          <p className="text-[#6B8BA4] text-sm leading-relaxed" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Document angular & offset misalignment measurements for driver-driven equipment. Includes before/after comparisons and PASS/FAIL status.
          </p>

          <div className="mt-6 flex gap-2 flex-wrap">
            {["Motor", "Pump", "Gearbox", "Compressor"].map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded text-xs font-medium bg-[#0D1B2A] text-[#1E90FF] border border-[#1E3A5F]"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 text-[#1E90FF] font-semibold text-sm">
            <span>Create Alignment Report</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </motion.button>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-[#4A6580] text-sm"
        style={{ fontFamily: "Space Grotesk, sans-serif" }}
      >
        Both report types are stored in the cloud and exportable as PDFs
      </motion.p>
    </div>
  );
}

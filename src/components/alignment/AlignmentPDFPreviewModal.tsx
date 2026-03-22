import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Download, RefreshCw, Share2, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { AlignmentReport, CompanyBranding } from "@/types/report";
import AlignmentPDFTemplate from "./AlignmentPDFTemplate";
import { toast } from "sonner";

interface AlignmentPDFPreviewModalProps {
  report: AlignmentReport;
  branding: CompanyBranding;
  onClose: () => void;
}

export default function AlignmentPDFPreviewModal({
  report,
  branding,
  onClose,
}: AlignmentPDFPreviewModalProps) {
  const templateRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    if (!templateRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#F4F8FB",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${report.caseId}-alignment-report.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (e) {
      toast.error("Failed to generate PDF");
    }
    setGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#112233] border-b border-[#1E3A5F] shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-[#6B8BA4] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-white font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
              Alignment Report Preview
            </h2>
            <p className="text-xs font-mono text-[#1E90FF]">{report.caseId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.info("Share link copied!")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1E3A5F] text-[#6B8BA4] hover:text-white text-sm transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handleDownload}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1E90FF] text-white font-semibold text-sm hover:bg-[#1a7fe0] transition-colors disabled:opacity-60"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {generating ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-auto bg-[#0D1B2A] flex items-start justify-center py-8 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}
        >
          <div ref={templateRef}>
            <AlignmentPDFTemplate report={report} branding={branding} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Download, RefreshCw, Share2, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Report, CompanyBranding } from "@/types/report";
import PDFTemplate from "./PDFTemplate";
import { toast } from "sonner";

interface PDFPreviewModalProps {
  report: Report;
  branding: CompanyBranding;
  onClose: () => void;
}

export default function PDFPreviewModal({ report, branding, onClose }: PDFPreviewModalProps) {
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
      pdf.save(`${report.caseId}-report.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (e) {
      toast.error("Failed to generate PDF. Please try again.");
    }
    setGenerating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex flex-col">
      {/* Modal Header */}
      <div className="bg-[#162032] border-b border-[#1E3A5F] px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-white font-bold text-sm">PDF Preview</h2>
          <p className="text-[#00C9A7] text-[10px] font-mono">{report.caseId}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00C9A7] to-[#1E90FF] text-[#0D1B2A] font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {generating ? "Generating..." : "Download PDF"}
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-[#0D1B2A] border border-[#1E3A5F] flex items-center justify-center text-[#4A6B8A] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="flex-1 overflow-auto bg-[#0D1B2A] p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto shadow-2xl shadow-black"
          style={{ width: "794px", maxWidth: "100%" }}
        >
          <div ref={templateRef}>
            <PDFTemplate report={report} branding={branding} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

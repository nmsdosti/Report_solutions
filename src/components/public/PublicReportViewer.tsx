import { useRef, useState, useEffect } from "react";
import { Download, Loader2, FileText, Zap } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Report, CompanyBranding } from "@/types/report";
import { dataService } from "@/lib/dataService";
import PDFTemplate from "@/components/pdf/PDFTemplate";

interface PublicReportViewerProps {
  caseId: string;
}

export default function PublicReportViewer({ caseId }: PublicReportViewerProps) {
  const templateRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [branding, setBranding] = useState<CompanyBranding>({
    companyName: "TechBal Solutions",
    phone: "",
    email: "",
    website: "",
    logo: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReport() {
      try {
        // Try dataService first (checks Supabase then localStorage)
        const found = await dataService.getReportByCaseId(caseId);
        if (found) {
          setReport(found);
          const brandingData = await dataService.getBranding();
          setBranding(brandingData);
        } else {
          setError("Report not found. The case ID may be invalid or the report may have been deleted.");
        }
      } catch {
        setError("Failed to load report. Please try again.");
      }
      setLoading(false);
    }
    loadReport();
  }, [caseId]);

  const handleDownload = async () => {
    if (!templateRef.current || !report) return;
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
    } catch {
      // Silent fail
    }
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#00C9A7] animate-spin mx-auto mb-4" />
          <p className="text-[#4A6B8A] text-sm">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 rounded-2xl bg-[#162032] border border-[#1E3A5F] flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-[#4A6B8A]" />
          </div>
          <h2 className="text-white font-bold text-lg mb-2">Report Not Found</h2>
          <p className="text-[#4A6B8A] text-sm mb-4">
            {error || "The requested report could not be found."}
          </p>
          <p className="text-[#2A4A6A] text-xs font-mono">
            Case ID: {caseId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 bg-[#0D1B2A]/95 backdrop-blur border-b border-[#1E3A5F]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C9A7] to-[#1E90FF] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#0D1B2A]" />
            </div>
            <div>
              <div className="text-white font-bold text-xs tracking-wider">TECHBAL REPORT</div>
              <div className="text-[#00C9A7] text-[10px] font-mono">{report.caseId}</div>
            </div>
          </div>
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
        </div>
      </header>

      {/* Report Preview */}
      <div className="p-4 sm:p-6">
        <div
          className="mx-auto shadow-2xl shadow-black"
          style={{ width: "794px", maxWidth: "100%" }}
        >
          <div ref={templateRef}>
            <PDFTemplate report={report} branding={branding} />
          </div>
        </div>
      </div>
    </div>
  );
}

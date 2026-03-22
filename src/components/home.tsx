import { useState, useCallback, useEffect } from "react";
import { Toaster } from "sonner";
import AuthScreen from "@/components/auth/AuthScreen";
import Dashboard from "@/components/dashboard/Dashboard";
import ReportForm from "@/components/form/ReportForm";
import PDFPreviewModal from "@/components/pdf/PDFPreviewModal";
import SettingsPage from "@/components/settings/SettingsPage";
import ReportTypeSelector from "@/components/ReportTypeSelector";
import AlignmentForm from "@/components/alignment/AlignmentForm";
import AlignmentPDFPreviewModal from "@/components/alignment/AlignmentPDFPreviewModal";
import { Report, User, CompanyBranding, AlignmentReport } from "@/types/report";
import { storage } from "@/lib/storage";
import { dataService } from "@/lib/dataService";

type AppView =
  | "auth"
  | "reportTypeSelector"
  | "dashboard"
  | "form"
  | "pdf"
  | "settings"
  | "alignmentForm"
  | "alignmentPdf";

function Home() {
  const [view, setView] = useState<AppView>(() =>
    storage.isAuthenticated() ? "dashboard" : "auth"
  );
  const [user, setUser] = useState<User | null>(() => storage.getUser());
  const [reports, setReports] = useState<Report[]>(() => storage.getReports());
  const [branding, setBranding] = useState<CompanyBranding>(() =>
    storage.getBranding()
  );
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [pdfReport, setPdfReport] = useState<Report | null>(null);

  // Alignment state
  const [alignmentReports, setAlignmentReports] = useState<AlignmentReport[]>([]);
  const [editingAlignmentReport, setEditingAlignmentReport] =
    useState<AlignmentReport | null>(null);
  const [alignmentPdfReport, setAlignmentPdfReport] =
    useState<AlignmentReport | null>(null);

  // Load data from Supabase on mount (async)
  useEffect(() => {
    dataService.getReports().then(setReports);
    dataService.getBranding().then(setBranding);
    dataService.getAlignmentReports().then(setAlignmentReports);
  }, []);

  const refreshReports = useCallback(async () => {
    const [balancing, alignment] = await Promise.all([
      dataService.getReports(),
      dataService.getAlignmentReports(),
    ]);
    setReports(balancing);
    setAlignmentReports(alignment);
  }, []);

  const handleAuthenticated = (u: User) => {
    setUser(u);
    // After login, show report type selector
    setView("reportTypeSelector");
    dataService.getReports().then(setReports);
    dataService.getAlignmentReports().then(setAlignmentReports);
  };

  // Report type selector
  const handleSelectReportType = (type: "balancing" | "alignment") => {
    if (type === "balancing") {
      setEditingReport(null);
      setView("form");
    } else {
      setEditingAlignmentReport(null);
      setView("alignmentForm");
    }
  };

  // ── Balancing flow ──
  const handleNewReport = () => {
    setView("reportTypeSelector");
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setView("form");
  };

  const handleSaveReport = async (report: Report) => {
    await dataService.saveReport(report);
    await refreshReports();
    setView("dashboard");
  };

  const handleGeneratePDF = async (report: Report) => {
    await dataService.saveReport(report);
    setPdfReport(report);
    await refreshReports();
    setView("pdf");
  };

  const handleDownloadPDF = (report: Report) => {
    setPdfReport(report);
    setView("pdf");
  };

  const handleDeleteReport = async (id: string) => {
    await dataService.deleteReport(id);
    await refreshReports();
  };

  const handleToggleStatus = async (id: string) => {
    const report = reports.find((r) => r.id === id);
    if (!report) return;
    const updated = {
      ...report,
      status: (report.status === "completed"
        ? "pending"
        : "completed") as "completed" | "pending",
      updatedAt: new Date().toISOString(),
    };
    await dataService.saveReport(updated);
    await refreshReports();
  };

  const handleLogout = () => {
    storage.logout();
    setUser(null);
    setView("auth");
  };

  const handleSaveBranding = async (b: CompanyBranding) => {
    await dataService.saveBranding(b);
    setBranding(b);
    setView("dashboard");
  };

  // ── Alignment flow ──
  const handleSaveAlignmentReport = async (report: AlignmentReport) => {
    await dataService.saveAlignmentReport(report);
    await refreshReports();
    setView("dashboard");
  };

  const handleGenerateAlignmentPDF = async (report: AlignmentReport) => {
    await dataService.saveAlignmentReport(report);
    setAlignmentPdfReport(report);
    await refreshReports();
    setView("alignmentPdf");
  };

  const handleEditAlignmentReport = (report: AlignmentReport) => {
    setEditingAlignmentReport(report);
    setView("alignmentForm");
  };

  const handleDownloadAlignmentPDF = (report: AlignmentReport) => {
    setAlignmentPdfReport(report);
    setView("alignmentPdf");
  };

  const handleDeleteAlignmentReport = async (id: string) => {
    await dataService.deleteAlignmentReport(id);
    await refreshReports();
  };

  const handleToggleAlignmentStatus = async (id: string) => {
    const report = alignmentReports.find((r) => r.id === id);
    if (!report) return;
    const updated = {
      ...report,
      status: (report.status === "completed" ? "pending" : "completed") as "completed" | "pending",
      updatedAt: new Date().toISOString(),
    };
    await dataService.saveAlignmentReport(updated);
    await refreshReports();
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "#162032",
            border: "1px solid #1E3A5F",
            color: "white",
          },
        }}
      />

      {view === "auth" && (
        <AuthScreen onAuthenticated={handleAuthenticated} />
      )}

      {view === "reportTypeSelector" && (
        <div className="relative">
          <button
            onClick={() => setView("dashboard")}
            className="absolute top-4 right-4 z-10 text-xs text-[#4A6580] hover:text-[#00C9A7] transition-colors px-3 py-1.5 rounded-lg border border-[#1E3A5F]"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Go to Dashboard →
          </button>
          <ReportTypeSelector onSelect={handleSelectReportType} />
        </div>
      )}

      {view === "dashboard" && user && (
        <Dashboard
          user={user}
          reports={reports}
          alignmentReports={alignmentReports}
          onNewReport={handleNewReport}
          onEditReport={handleEditReport}
          onDownloadPDF={handleDownloadPDF}
          onDeleteReport={handleDeleteReport}
          onToggleStatus={handleToggleStatus}
          onEditAlignmentReport={handleEditAlignmentReport}
          onDownloadAlignmentPDF={handleDownloadAlignmentPDF}
          onDeleteAlignmentReport={handleDeleteAlignmentReport}
          onToggleAlignmentStatus={handleToggleAlignmentStatus}
          onSettings={() => setView("settings")}
          onLogout={handleLogout}
          onRefresh={refreshReports}
        />
      )}

      {view === "form" && (
        <ReportForm
          existingReport={editingReport}
          onClose={() => setView("dashboard")}
          onSave={handleSaveReport}
          onGeneratePDF={handleGeneratePDF}
        />
      )}

      {view === "settings" && (
        <SettingsPage
          branding={branding}
          onClose={() => setView("dashboard")}
          onSave={handleSaveBranding}
        />
      )}

      {view === "pdf" && pdfReport && (
        <PDFPreviewModal
          report={pdfReport}
          branding={branding}
          onClose={() => {
            setView("dashboard");
            refreshReports();
          }}
        />
      )}

      {view === "alignmentForm" && (
        <AlignmentForm
          existingReport={editingAlignmentReport}
          onClose={() => setView("dashboard")}
          onSave={handleSaveAlignmentReport}
          onGeneratePDF={handleGenerateAlignmentPDF}
        />
      )}

      {view === "alignmentPdf" && alignmentPdfReport && (
        <AlignmentPDFPreviewModal
          report={alignmentPdfReport}
          branding={branding}
          onClose={() => setView("dashboard")}
        />
      )}
    </div>
  );
}

export default Home;

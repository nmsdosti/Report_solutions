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
import { supabase } from "@/lib/supabase";

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
  const [view, setView] = useState<AppView>("auth");
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
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

  // Restore Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u: User = {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "",
        };
        setUser(u);
        storage.saveUser(u);
        storage.setAuthenticated(true);
        setView("dashboard");
        dataService.getReports().then(setReports);
        dataService.getBranding().then(setBranding);
        dataService.getAlignmentReports().then(setAlignmentReports);
      } else {
        // No valid session — ensure clean state
        storage.logout();
        setView("auth");
      }
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        storage.logout();
        setReports([]);
        setAlignmentReports([]);
      }
    });

    return () => subscription.unsubscribe();
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
    setView("reportTypeSelector");
    dataService.getReports().then(setReports);
    dataService.getAlignmentReports().then(setAlignmentReports);
    dataService.getBranding().then(setBranding);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    storage.logout();
    setUser(null);
    setReports([]);
    setAlignmentReports([]);
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

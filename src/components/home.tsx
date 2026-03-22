import { useState, useCallback, useEffect } from "react";
import { Toaster } from "sonner";
import AuthScreen from "@/components/auth/AuthScreen";
import Dashboard from "@/components/dashboard/Dashboard";
import ReportForm from "@/components/form/ReportForm";
import PDFPreviewModal from "@/components/pdf/PDFPreviewModal";
import SettingsPage from "@/components/settings/SettingsPage";
import { Report, User, CompanyBranding } from "@/types/report";
import { storage } from "@/lib/storage";
import { dataService } from "@/lib/dataService";

type AppView = "auth" | "dashboard" | "form" | "pdf" | "settings";

function Home() {
  const [view, setView] = useState<AppView>(() =>
    storage.isAuthenticated() ? "dashboard" : "auth"
  );
  const [user, setUser] = useState<User | null>(() => storage.getUser());
  const [reports, setReports] = useState<Report[]>(() => storage.getReports());
  const [branding, setBranding] = useState<CompanyBranding>(() => storage.getBranding());
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [pdfReport, setPdfReport] = useState<Report | null>(null);

  // Load data from Supabase on mount (async)
  useEffect(() => {
    dataService.getReports().then(setReports);
    dataService.getBranding().then(setBranding);
  }, []);

  const refreshReports = useCallback(async () => {
    const data = await dataService.getReports();
    setReports(data);
  }, []);

  const handleAuthenticated = (u: User) => {
    setUser(u);
    setView("dashboard");
    dataService.getReports().then(setReports);
  };

  const handleNewReport = () => {
    setEditingReport(null);
    setView("form");
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
      status: (report.status === "completed" ? "pending" : "completed") as "completed" | "pending",
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

      {view === "dashboard" && user && (
        <Dashboard
          user={user}
          reports={reports}
          onNewReport={handleNewReport}
          onEditReport={handleEditReport}
          onDownloadPDF={handleDownloadPDF}
          onDeleteReport={handleDeleteReport}
          onToggleStatus={handleToggleStatus}
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
    </div>
  );
}

export default Home;

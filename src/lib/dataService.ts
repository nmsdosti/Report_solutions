import { storage } from "@/lib/storage";
import { Report, CompanyBranding, AlignmentReport } from "@/types/report";

export const dataService = {
  // ==================== REPORTS ====================
  async getReports(): Promise<Report[]> {
    return storage.getReports();
  },

  async saveReport(report: Report): Promise<void> {
    const reports = storage.getReports();
    const idx = reports.findIndex((r) => r.id === report.id);
    if (idx >= 0) reports[idx] = report;
    else reports.unshift(report);
    storage.saveReports(reports);
  },

  async deleteReport(id: string): Promise<void> {
    const reports = storage.getReports().filter((r) => r.id !== id);
    storage.saveReports(reports);
  },

  async getReportByCaseId(caseId: string): Promise<Report | null> {
    const reports = storage.getReports();
    return reports.find((r) => r.caseId === caseId) || null;
  },

  // ==================== BRANDING ====================
  async getBranding(): Promise<CompanyBranding> {
    return storage.getBranding();
  },

  async saveBranding(branding: CompanyBranding): Promise<void> {
    storage.saveBranding(branding);
  },

  // ==================== ALIGNMENT REPORTS ====================
  async getAlignmentReports(): Promise<AlignmentReport[]> {
    try {
      return JSON.parse(localStorage.getItem("alignment_reports") || "[]");
    } catch {
      return [];
    }
  },

  async saveAlignmentReport(report: AlignmentReport): Promise<void> {
    const existing: AlignmentReport[] = JSON.parse(
      localStorage.getItem("alignment_reports") || "[]"
    );
    const idx = existing.findIndex((r) => r.id === report.id);
    if (idx >= 0) existing[idx] = report;
    else existing.unshift(report);
    localStorage.setItem("alignment_reports", JSON.stringify(existing));
  },

  async deleteAlignmentReport(id: string): Promise<void> {
    const existing: AlignmentReport[] = JSON.parse(
      localStorage.getItem("alignment_reports") || "[]"
    );
    localStorage.setItem(
      "alignment_reports",
      JSON.stringify(existing.filter((r) => r.id !== id))
    );
  },
};

import { supabase, isSupabaseConnected } from "@/lib/supabase";
import { storage } from "@/lib/storage";
import { Report, CompanyBranding } from "@/types/report";

/**
 * Data service that syncs to Supabase when connected, falling back to localStorage.
 * 
 * When Supabase is connected, it will:
 * - Save reports to a "reports" table
 * - Save branding to a "company_branding" table
 * - Read from Supabase for all operations
 * 
 * When Supabase is NOT connected, all operations use localStorage.
 */
export const dataService = {
  // ==================== REPORTS ====================
  async getReports(): Promise<Report[]> {
    if (isSupabaseConnected() && supabase) {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (data || []).map(mapDbReportToReport);
      } catch (e) {
        console.warn("Supabase fetch failed, falling back to localStorage:", e);
      }
    }
    return storage.getReports();
  },

  async saveReport(report: Report): Promise<void> {
    // Always save to localStorage as cache
    const reports = storage.getReports();
    const idx = reports.findIndex((r) => r.id === report.id);
    if (idx >= 0) {
      reports[idx] = report;
    } else {
      reports.unshift(report);
    }
    storage.saveReports(reports);

    // Also save to Supabase if connected
    if (isSupabaseConnected() && supabase) {
      try {
        const dbReport = mapReportToDb(report);
        const { error } = await supabase
          .from("reports")
          .upsert(dbReport, { onConflict: "id" });
        if (error) {
          console.error("Supabase save failed:", error.message, error.details, error.hint);
        } else {
          console.log("Report saved to Supabase:", report.caseId);
        }
      } catch (e) {
        console.error("Supabase save error:", e);
      }
    }
  },

  async deleteReport(id: string): Promise<void> {
    const reports = storage.getReports().filter((r) => r.id !== id);
    storage.saveReports(reports);

    if (isSupabaseConnected() && supabase) {
      try {
        await supabase.from("reports").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase delete error:", e);
      }
    }
  },

  async getReportByCaseId(caseId: string): Promise<Report | null> {
    if (isSupabaseConnected() && supabase) {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .eq("case_id", caseId)
          .single();
        if (!error && data) {
          return mapDbReportToReport(data);
        }
      } catch (e) {
        console.warn("Supabase fetch by case_id failed:", e);
      }
    }
    // Fallback to localStorage
    const reports = storage.getReports();
    return reports.find((r) => r.caseId === caseId) || null;
  },

  // ==================== BRANDING ====================
  async getBranding(): Promise<CompanyBranding> {
    if (isSupabaseConnected() && supabase) {
      try {
        const { data, error } = await supabase
          .from("company_branding")
          .select("*")
          .limit(1)
          .single();
        if (!error && data) {
          return {
            companyName: data.company_name || "",
            phone: data.phone || "",
            email: data.email || "",
            website: data.website || "",
            logo: data.logo || null,
          };
        }
      } catch (e) {
        console.warn("Supabase branding fetch failed:", e);
      }
    }
    return storage.getBranding();
  },

  async saveBranding(branding: CompanyBranding): Promise<void> {
    storage.saveBranding(branding);

    if (isSupabaseConnected() && supabase) {
      try {
        const { error } = await supabase
          .from("company_branding")
          .upsert({
            id: "default",
            company_name: branding.companyName,
            phone: branding.phone,
            email: branding.email,
            website: branding.website,
            logo: branding.logo,
          }, { onConflict: "id" });
        if (error) console.warn("Supabase branding save failed:", error);
      } catch (e) {
        console.warn("Supabase branding save error:", e);
      }
    }
  },
};

// ==================== DB MAPPING ====================
// Maps camelCase Report to snake_case DB columns
function mapReportToDb(report: Report): Record<string, unknown> {
  return {
    id: report.id,
    case_id: report.caseId,
    status: report.status,
    created_at: report.createdAt,
    updated_at: report.updatedAt,
    equipment_name: report.equipmentName,
    equipment_id: report.equipmentId,
    location: report.location,
    customer_name: report.customerName,
    balancing_date: report.balancingDate,
    technician_name: report.technicianName,
    machine_type: report.machineType,
    balancing_method: report.balancingMethod,
    measurement_points: report.measurementPoints,
    trial_weight: report.trialWeight,
    trial_angle: report.trialAngle,
    final_correction_weight: report.finalCorrectionWeight,
    final_angle: report.finalAngle,
    final_correction_weight_2: report.finalCorrectionWeight2,
    final_angle_2: report.finalAngle2,
    rpm: report.rpm,
    reference_point: report.referencePoint,
    service_remarks: report.serviceRemarks,
    recommendations: report.recommendations,
    customer_acknowledgment: report.customerAcknowledgment,
  };
}

// Maps snake_case DB row to camelCase Report
function mapDbReportToReport(data: Record<string, unknown>): Report {
  return {
    id: data.id as string,
    caseId: data.case_id as string,
    status: data.status as "completed" | "pending",
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    equipmentName: data.equipment_name as string,
    equipmentId: data.equipment_id as string,
    location: data.location as string,
    customerName: data.customer_name as string,
    balancingDate: data.balancing_date as string,
    technicianName: data.technician_name as string,
    machineType: data.machine_type as "fan" | "blower" | "motor" | "pump",
    balancingMethod: data.balancing_method as "single" | "dual",
    measurementPoints: (data.measurement_points as Report["measurementPoints"]) || [],
    trialWeight: data.trial_weight as number,
    trialAngle: data.trial_angle as number,
    finalCorrectionWeight: data.final_correction_weight as number,
    finalAngle: data.final_angle as number,
    finalCorrectionWeight2: data.final_correction_weight_2 as number,
    finalAngle2: data.final_angle_2 as number,
    rpm: data.rpm as number,
    referencePoint: data.reference_point as string,
    serviceRemarks: data.service_remarks as string,
    recommendations: data.recommendations as string,
    customerAcknowledgment: data.customer_acknowledgment as string,
  };
}

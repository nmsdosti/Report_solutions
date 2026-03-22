import { supabase, isSupabaseConnected } from "@/lib/supabase";
import { storage } from "@/lib/storage";
import { Report, CompanyBranding, AlignmentReport } from "@/types/report";

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export const dataService = {
  // ==================== REPORTS ====================
  async getReports(): Promise<Report[]> {
    if (isSupabaseConnected()) {
      try {
        const userId = await getCurrentUserId();
        let query = supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false });
        if (userId) query = query.eq("user_id", userId);
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(mapDbReportToReport);
      } catch (e) {
        console.warn("Supabase fetch failed, falling back to localStorage:", e);
      }
    }
    return storage.getReports();
  },

  async saveReport(report: Report): Promise<void> {
    const reports = storage.getReports();
    const idx = reports.findIndex((r) => r.id === report.id);
    if (idx >= 0) reports[idx] = report;
    else reports.unshift(report);
    storage.saveReports(reports);

    if (isSupabaseConnected()) {
      try {
        const userId = await getCurrentUserId();
        const dbReport = mapReportToDb(report, userId);
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
    if (isSupabaseConnected()) {
      try {
        await supabase.from("reports").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase delete error:", e);
      }
    }
  },

  async getReportByCaseId(caseId: string): Promise<Report | null> {
    if (isSupabaseConnected()) {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .eq("case_id", caseId)
          .single();
        if (!error && data) return mapDbReportToReport(data);
      } catch (e) {
        console.warn("Supabase fetch by case_id failed:", e);
      }
    }
    const reports = storage.getReports();
    return reports.find((r) => r.caseId === caseId) || null;
  },

  // ==================== BRANDING ====================
  async getBranding(): Promise<CompanyBranding> {
    if (isSupabaseConnected()) {
      try {
        const userId = await getCurrentUserId();
        if (userId) {
          const { data, error } = await supabase
            .from("company_branding")
            .select("*")
            .eq("user_id", userId)
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
        }
      } catch (e) {
        console.warn("Supabase branding fetch failed:", e);
      }
    }
    return storage.getBranding();
  },

  async saveBranding(branding: CompanyBranding): Promise<void> {
    storage.saveBranding(branding);
    if (isSupabaseConnected()) {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;
        const { error } = await supabase.from("company_branding").upsert(
          {
            id: userId,
            user_id: userId,
            company_name: branding.companyName,
            phone: branding.phone,
            email: branding.email,
            website: branding.website,
            logo: branding.logo,
          },
          { onConflict: "id" }
        );
        if (error) console.warn("Supabase branding save failed:", error);
      } catch (e) {
        console.warn("Supabase branding save error:", e);
      }
    }
  },

  // ==================== ALIGNMENT REPORTS ====================
  async getAlignmentReports(): Promise<AlignmentReport[]> {
    if (isSupabaseConnected()) {
      try {
        const userId = await getCurrentUserId();
        let query = supabase
          .from("alignment_reports")
          .select("*")
          .order("created_at", { ascending: false });
        if (userId) query = query.eq("user_id", userId);
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(mapDbToAlignmentReport);
      } catch (e) {
        console.warn("Supabase alignment fetch failed, falling back to localStorage:", e);
      }
    }
    return JSON.parse(localStorage.getItem("alignment_reports") || "[]");
  },

  async saveAlignmentReport(report: AlignmentReport): Promise<void> {
    const existing: AlignmentReport[] = JSON.parse(
      localStorage.getItem("alignment_reports") || "[]"
    );
    const idx = existing.findIndex((r) => r.id === report.id);
    if (idx >= 0) existing[idx] = report;
    else existing.unshift(report);
    localStorage.setItem("alignment_reports", JSON.stringify(existing));

    if (isSupabaseConnected()) {
      try {
        const userId = await getCurrentUserId();
        const dbReport = mapAlignmentReportToDb(report, userId);
        const { error } = await supabase
          .from("alignment_reports")
          .upsert(dbReport, { onConflict: "id" });
        if (error) {
          console.error("Supabase alignment save failed:", error.message, error.details);
        } else {
          console.log("Alignment report saved to Supabase:", report.caseId);
        }
      } catch (e) {
        console.error("Supabase alignment save error:", e);
      }
    }
  },

  async deleteAlignmentReport(id: string): Promise<void> {
    const existing: AlignmentReport[] = JSON.parse(
      localStorage.getItem("alignment_reports") || "[]"
    );
    localStorage.setItem(
      "alignment_reports",
      JSON.stringify(existing.filter((r) => r.id !== id))
    );
    if (isSupabaseConnected()) {
      try {
        await supabase.from("alignment_reports").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase alignment delete error:", e);
      }
    }
  },
};

// ==================== DB MAPPING ====================
function mapReportToDb(
  report: Report,
  userId?: string | null
): Record<string, unknown> {
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
    ...(userId ? { user_id: userId } : {}),
  };
}

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
    measurementPoints:
      (data.measurement_points as Report["measurementPoints"]) || [],
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

function mapAlignmentReportToDb(
  report: AlignmentReport,
  userId?: string | null
): Record<string, unknown> {
  return {
    id: report.id,
    case_id: report.caseId,
    status: report.status,
    created_at: report.createdAt,
    updated_at: report.updatedAt,
    driver_type: report.driverType,
    driven_type: report.drivenType,
    driver_name: report.driverName,
    driven_name: report.drivenName,
    project_name: report.projectName,
    equipment_tag: report.equipmentTag,
    location: report.location,
    customer_name: report.customerName,
    alignment_date: report.alignmentDate,
    technician_name: report.technicianName,
    alignment_method: report.alignmentMethod,
    before_data: report.before,
    after_data: report.after,
    tolerance_offset_max: report.toleranceOffsetMax,
    tolerance_angle_max: report.toleranceAngleMax,
    angular_tolerance: report.angularTolerance,
    offset_tolerance: report.offsetTolerance,
    service_remarks: report.serviceRemarks,
    recommendations: report.recommendations,
    approved_by: report.approvedBy,
    customer_acknowledgment: report.customerAcknowledgment,
    rpm: report.rpm,
    coupling_type: report.couplingType,
    shim_added: report.shimAdded,
    ...(userId ? { user_id: userId } : {}),
  };
}

function mapDbToAlignmentReport(
  data: Record<string, unknown>
): AlignmentReport {
  return {
    id: data.id as string,
    caseId: data.case_id as string,
    status: data.status as "completed" | "pending",
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    driverType: data.driver_type as AlignmentReport["driverType"],
    drivenType: data.driven_type as AlignmentReport["drivenType"],
    driverName: data.driver_name as string,
    drivenName: data.driven_name as string,
    projectName: data.project_name as string,
    equipmentTag: data.equipment_tag as string,
    location: data.location as string,
    customerName: data.customer_name as string,
    alignmentDate: data.alignment_date as string,
    technicianName: data.technician_name as string,
    alignmentMethod: data.alignment_method as AlignmentReport["alignmentMethod"],
    before: (data.before_data as AlignmentReport["before"]) || {
      angularVertical: 0,
      angularHorizontal: 0,
      offsetVertical: 0,
      offsetHorizontal: 0,
    },
    after: (data.after_data as AlignmentReport["after"]) || {
      angularVertical: 0,
      angularHorizontal: 0,
      offsetVertical: 0,
      offsetHorizontal: 0,
    },
    toleranceOffsetMax: data.tolerance_offset_max as number,
    toleranceAngleMax: data.tolerance_angle_max as number,
    angularTolerance: data.angular_tolerance as number,
    offsetTolerance: data.offset_tolerance as number,
    serviceRemarks: data.service_remarks as string,
    recommendations: data.recommendations as string,
    approvedBy: data.approved_by as string,
    customerAcknowledgment: data.customer_acknowledgment as string,
    rpm: data.rpm as number,
    couplingType: data.coupling_type as string,
    shimAdded: data.shim_added as string,
  };
}

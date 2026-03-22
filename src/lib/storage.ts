import { Report, CompanyBranding, User } from "@/types/report";

const REPORTS_KEY = "dbr_reports";
const BRANDING_KEY = "dbr_branding";
const USER_KEY = "dbr_user";
const AUTH_KEY = "dbr_authenticated";

export const storage = {
  getReports: (): Report[] => {
    try {
      return JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
    } catch {
      return [];
    }
  },
  saveReports: (reports: Report[]) => {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  },
  getBranding: (): CompanyBranding => {
    try {
      return JSON.parse(
        localStorage.getItem(BRANDING_KEY) ||
          JSON.stringify({
            companyName: "TechBal Solutions",
            phone: "+91 123 456 8800",
            email: "bala@oe.ah",
            website: "techbalsolutions.com",
            logo: null,
          })
      );
    } catch {
      return {
        companyName: "TechBal Solutions",
        phone: "+91 123 456 8800",
        email: "bala@oe.ah",
        website: "techbalsolutions.com",
        logo: null,
      };
    }
  },
  saveBranding: (branding: CompanyBranding) => {
    localStorage.setItem(BRANDING_KEY, JSON.stringify(branding));
  },
  getUser: (): User | null => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  },
  saveUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  isAuthenticated: (): boolean => {
    return localStorage.getItem(AUTH_KEY) === "true";
  },
  setAuthenticated: (value: boolean) => {
    localStorage.setItem(AUTH_KEY, value ? "true" : "false");
  },
  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REPORTS_KEY);
    localStorage.removeItem(BRANDING_KEY);
    localStorage.removeItem("alignment_reports");
  },
};

export const generateCaseId = (): string => {
  const now = new Date();
  const dateStr = now
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const existing = storage.getReports();
  const todayReports = existing.filter((r) =>
    r.caseId.includes(dateStr)
  );
  const seq = String(todayReports.length + 1).padStart(3, "0");
  return `DBR-${dateStr}-${seq}`;
};

export const calcReduction = (pre: number, post: number): number => {
  if (!pre || pre === 0) return 0;
  return Math.round(((pre - post) / pre) * 1000) / 10;
};

export const getImprovementStatus = (
  reduction: number
): "excellent" | "good" | "needs-attention" => {
  if (reduction >= 80) return "excellent";
  if (reduction >= 50) return "good";
  return "needs-attention";
};

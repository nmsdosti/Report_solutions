export interface MeasurementPoint {
  id: string;
  pointName: string;
  direction: "H" | "V" | "A";
  preBalancing: number;
  postBalancing: number;
}

export interface Report {
  id: string;
  caseId: string;
  status: "completed" | "pending";
  createdAt: string;
  updatedAt: string;

  // Step 1 - Equipment Details
  equipmentName: string;
  equipmentId: string;
  location: string;
  customerName: string;
  balancingDate: string;
  technicianName: string;
  machineType: "fan" | "blower" | "motor" | "pump";
  balancingMethod: "single" | "dual";

  // Step 2 - Vibration Data
  measurementPoints: MeasurementPoint[];

  // Step 3 - Balancing Parameters
  trialWeight: number;
  trialAngle: number;
  finalCorrectionWeight: number;
  finalAngle: number;
  // Dual plane fields (Plane 2)
  finalCorrectionWeight2: number;
  finalAngle2: number;
  rpm: number;
  referencePoint: string;

  // Step 5 - Notes
  serviceRemarks: string;
  recommendations: string;
  customerAcknowledgment: string;
}

export interface CompanyBranding {
  companyName: string;
  phone: string;
  email: string;
  website: string;
  logo: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

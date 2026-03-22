// ─── Alignment Report Types ────────────────────────────────────────────────

export type AlignmentEquipmentType =
  | "motor"
  | "pump"
  | "fan"
  | "blower"
  | "gearbox"
  | "compressor"
  | "other";

export interface AlignmentMeasurement {
  angularVertical: number;
  angularHorizontal: number;
  offsetVertical: number;
  offsetHorizontal: number;
}

export interface AlignmentReport {
  id: string;
  caseId: string;
  status: "completed" | "pending";
  createdAt: string;
  updatedAt: string;

  // Equipment Selection
  driverType: AlignmentEquipmentType;
  drivenType: AlignmentEquipmentType;
  driverName: string;
  drivenName: string;

  // Step 1 - Job Details
  projectName: string;
  equipmentTag: string;
  location: string;
  customerName: string;
  alignmentDate: string;
  technicianName: string;
  alignmentMethod: "dial_indicator" | "laser" | "reverse_dial" | "optical";

  // Step 2 - Measurements Before
  before: AlignmentMeasurement;

  // Step 3 - Measurements After
  after: AlignmentMeasurement;

  // Step 4 - Tolerances & Targets
  toleranceOffsetMax: number;
  toleranceAngleMax: number;
  angularTolerance: number;
  offsetTolerance: number;

  // Step 5 - Notes & Signatures
  serviceRemarks: string;
  recommendations: string;
  approvedBy: string;
  customerAcknowledgment: string;
  rpm: number;
  couplingType: string;
  shimAdded: string;
}

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

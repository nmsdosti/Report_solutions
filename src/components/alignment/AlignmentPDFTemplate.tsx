import { AlignmentReport, AlignmentEquipmentType, CompanyBranding } from "@/types/report";

interface AlignmentPDFTemplateProps {
  report: AlignmentReport;
  branding: CompanyBranding;
}

const EQUIPMENT_LABELS: Record<AlignmentEquipmentType, string> = {
  motor: "Electric Motor",
  pump: "Centrifugal Pump",
  fan: "Fan",
  blower: "Blower",
  gearbox: "Gearbox",
  compressor: "Compressor",
  other: "Equipment",
};

const METHOD_LABELS: Record<string, string> = {
  laser: "Laser Alignment",
  dial_indicator: "Dial Indicator",
  reverse_dial: "Reverse Dial",
  optical: "Optical",
};

function PassFailCell({ pass }: { pass: boolean }) {
  return (
    <td
      style={{
        background: pass ? "#16a34a" : "#dc2626",
        color: "white",
        fontWeight: 700,
        textAlign: "center",
        fontSize: "11px",
        padding: "4px 8px",
        letterSpacing: "0.05em",
      }}
    >
      {pass ? "✓ PASS" : "✗ FAIL"}
    </td>
  );
}

function EquipmentDiagram({
  driverLabel,
  drivenLabel,
  driverType,
  drivenType,
}: {
  driverLabel: string;
  drivenLabel: string;
  driverType: AlignmentEquipmentType;
  drivenType: AlignmentEquipmentType;
}) {
  // Color palette
  const bodyColor = "#4B6278";
  const bodyHighlight = "#6B8BA4";
  const shaftColor = "#374151";
  const couplingColor = "#1B6F82";
  const boltColor = "#94a3b8";

  // Motor: classic NEMA frame with terminal box
  const motorShape = (
    <g>
      {/* Main body */}
      <rect x="8" y="18" width="58" height="44" rx="5" fill={bodyColor} stroke="#2d4a5f" strokeWidth="1.5" />
      {/* Cooling fins */}
      {[22, 30, 38, 46, 54].map((x) => (
        <rect key={x} x={x} y="18" width="3" height="44" rx="1" fill={bodyHighlight} opacity="0.5" />
      ))}
      {/* Terminal box */}
      <rect x="20" y="10" width="24" height="12" rx="2" fill={bodyHighlight} stroke="#2d4a5f" strokeWidth="1" />
      <circle cx="29" cy="16" r="2" fill={shaftColor} />
      <circle cx="35" cy="16" r="2" fill={shaftColor} />
      <circle cx="41" cy="16" r="2" fill={shaftColor} />
      {/* Output shaft */}
      <rect x="66" y="35" width="12" height="10" rx="2" fill={shaftColor} />
      {/* Foot mounts */}
      <rect x="8" y="60" width="16" height="5" rx="1" fill={bodyHighlight} />
      <rect x="42" y="60" width="16" height="5" rx="1" fill={bodyHighlight} />
      <circle cx="16" cy="63" r="2" fill={boltColor} />
      <circle cx="50" cy="63" r="2" fill={boltColor} />
    </g>
  );

  // Pump: volute casing with impeller
  const pumpShape = (
    <g>
      {/* Volute casing */}
      <ellipse cx="42" cy="40" rx="28" ry="26" fill={bodyColor} stroke="#2d4a5f" strokeWidth="1.5" />
      <ellipse cx="42" cy="40" rx="20" ry="18" fill={bodyHighlight} opacity="0.4" />
      {/* Impeller blades */}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={42 + 5 * Math.cos(a)}
            y1={40 + 5 * Math.sin(a)}
            x2={42 + 16 * Math.cos(a + 0.5)}
            y2={40 + 16 * Math.sin(a + 0.5)}
            stroke={shaftColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="42" cy="40" r="5" fill={shaftColor} />
      {/* Discharge nozzle (top) */}
      <rect x="35" y="12" width="14" height="10" rx="2" fill={bodyColor} stroke="#2d4a5f" strokeWidth="1" />
      {/* Suction nozzle (left) */}
      <rect x="4" y="35" width="10" height="10" rx="2" fill={bodyColor} stroke="#2d4a5f" strokeWidth="1" />
      {/* Input shaft */}
      <rect x="70" y="36" width="8" height="8" rx="2" fill={shaftColor} />
      {/* Foot mounts */}
      <rect x="14" y="63" width="12" height="5" rx="1" fill={bodyHighlight} />
      <rect x="46" y="63" width="12" height="5" rx="1" fill={bodyHighlight} />
      <circle cx="20" cy="66" r="2" fill={boltColor} />
      <circle cx="52" cy="66" r="2" fill={boltColor} />
    </g>
  );

  // Fan: axial fan with housing
  const fanShape = (
    <g>
      {/* Housing ring */}
      <circle cx="40" cy="40" r="28" fill={bodyColor} stroke="#2d4a5f" strokeWidth="2" />
      <circle cx="40" cy="40" r="24" fill="#243547" />
      {/* Fan blades */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const a = (deg * Math.PI) / 180;
        const bx = 40 + 8 * Math.cos(a);
        const by = 40 + 8 * Math.sin(a);
        const ex = 40 + 22 * Math.cos(a + 0.6);
        const ey = 40 + 22 * Math.sin(a + 0.6);
        return (
          <line key={deg} x1={bx} y1={by} x2={ex} y2={ey} stroke={bodyHighlight} strokeWidth="4" strokeLinecap="round" />
        );
      })}
      {/* Hub */}
      <circle cx="40" cy="40" r="8" fill={bodyColor} stroke="#2d4a5f" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="4" fill={shaftColor} />
      {/* Shaft */}
      <rect x="68" y="37" width="10" height="6" rx="2" fill={shaftColor} />
    </g>
  );

  // Blower: centrifugal blower scroll housing
  const blowerShape = (
    <g>
      {/* Scroll housing */}
      <path d="M 12 22 Q 8 40 14 55 Q 20 65 40 65 Q 62 65 68 52 Q 72 40 65 25 Q 58 12 40 12 Q 22 12 12 22 Z" fill={bodyColor} stroke="#2d4a5f" strokeWidth="1.5" />
      {/* Inlet circle */}
      <circle cx="40" cy="40" r="16" fill="#243547" stroke="#2d4a5f" strokeWidth="1" />
      {/* Impeller */}
      {[0, 72, 144, 216, 288].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <line key={deg} x1={40 + 4 * Math.cos(a)} y1={40 + 4 * Math.sin(a)} x2={40 + 14 * Math.cos(a + 0.4)} y2={40 + 14 * Math.sin(a + 0.4)} stroke={bodyHighlight} strokeWidth="3.5" strokeLinecap="round" />
        );
      })}
      <circle cx="40" cy="40" r="4" fill={shaftColor} />
      {/* Discharge */}
      <rect x="60" y="12" width="12" height="18" rx="2" fill={bodyColor} stroke="#2d4a5f" strokeWidth="1" />
      {/* Input shaft */}
      <rect x="66" y="36" width="12" height="8" rx="2" fill={shaftColor} />
    </g>
  );

  // Gearbox: rectangular with gear symbols
  const gearboxShape = (
    <g>
      <rect x="6" y="14" width="62" height="52" rx="5" fill={bodyColor} stroke="#2d4a5f" strokeWidth="1.5" />
      {/* Large gear */}
      <circle cx="28" cy="36" r="14" fill="#243547" stroke={bodyHighlight} strokeWidth="1.5" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <rect
            key={deg}
            x={28 + 12 * Math.cos(a) - 2}
            y={36 + 12 * Math.sin(a) - 2}
            width="4"
            height="4"
            rx="0.5"
            fill={bodyHighlight}
            transform={`rotate(${deg}, ${28 + 12 * Math.cos(a)}, ${36 + 12 * Math.sin(a)})`}
          />
        );
      })}
      <circle cx="28" cy="36" r="4" fill={shaftColor} />
      {/* Small gear */}
      <circle cx="52" cy="46" r="10" fill="#243547" stroke={bodyHighlight} strokeWidth="1.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <rect key={deg} x={52 + 8 * Math.cos(a) - 1.5} y={46 + 8 * Math.sin(a) - 1.5} width="3" height="3" rx="0.5" fill={bodyHighlight} transform={`rotate(${deg}, ${52 + 8 * Math.cos(a)}, ${46 + 8 * Math.sin(a)})`} />
        );
      })}
      <circle cx="52" cy="46" r="3" fill={shaftColor} />
      {/* Shafts */}
      <rect x="0" y="33" width="8" height="6" rx="2" fill={shaftColor} />
      <rect x="68" y="43" width="8" height="6" rx="2" fill={shaftColor} />
    </g>
  );

  // Compressor: barrel style
  const compressorShape = (
    <g>
      <rect x="8" y="16" width="60" height="48" rx="6" fill={bodyColor} stroke="#2d4a5f" strokeWidth="1.5" />
      {/* Stage discs */}
      {[20, 30, 40, 50].map((x) => (
        <ellipse key={x} cx={x} cy="40" rx="4" ry="16" fill={bodyHighlight} opacity="0.5" stroke="#2d4a5f" strokeWidth="0.5" />
      ))}
      {/* Shaft through */}
      <rect x="8" y="38" width="60" height="4" rx="2" fill={shaftColor} opacity="0.7" />
      {/* Inlet/outlet flanges */}
      <rect x="0" y="33" width="10" height="14" rx="2" fill={bodyHighlight} stroke="#2d4a5f" strokeWidth="1" />
      <rect x="66" y="33" width="10" height="14" rx="2" fill={bodyHighlight} stroke="#2d4a5f" strokeWidth="1" />
      {/* Bolts on flanges */}
      {[36, 43].map((y) => (
        <circle key={y} cx="4" cy={y} r="1.5" fill={boltColor} />
      ))}
      {[36, 43].map((y) => (
        <circle key={y} cx="72" cy={y} r="1.5" fill={boltColor} />
      ))}
    </g>
  );

  const otherShape = (
    <g>
      <rect x="10" y="18" width="55" height="44" rx="5" fill={bodyColor} stroke="#2d4a5f" strokeWidth="1.5" />
      <text x="37" y="41" textAnchor="middle" fontSize="9" fill={bodyHighlight} fontWeight="bold">EQP</text>
      <rect x="0" y="33" width="12" height="10" rx="2" fill={shaftColor} />
      <rect x="63" y="33" width="12" height="10" rx="2" fill={shaftColor} />
    </g>
  );

  const getShape = (type: AlignmentEquipmentType) => {
    switch (type) {
      case "motor": return motorShape;
      case "pump": return pumpShape;
      case "fan": return fanShape;
      case "gearbox": return gearboxShape;
      case "blower": return blowerShape;
      case "compressor": return compressorShape;
      default: return otherShape;
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", padding: "4px 0" }}>
      {/* Driver Equipment */}
      <div style={{ textAlign: "center", minWidth: "130px" }}>
        <svg viewBox="0 0 80 80" width="120" height="100">
          {getShape(driverType)}
        </svg>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#1f2937", marginTop: "2px", lineHeight: 1.2 }}>{driverLabel}</div>
        <div style={{ fontSize: "10px", color: "#1B6F82", fontWeight: 600, letterSpacing: "0.04em" }}>DRIVER</div>
      </div>

      {/* Shaft + Coupling Assembly */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: "160px", maxWidth: "220px" }}>
        <svg viewBox="0 0 200 80" width="180" height="100" style={{ overflow: "visible" }}>
          {/* Shaft line */}
          <line x1="0" y1="40" x2="200" y2="40" stroke={shaftColor} strokeWidth="6" strokeLinecap="round" />
          {/* Shaft highlight */}
          <line x1="0" y1="38" x2="200" y2="38" stroke="#6B8BA4" strokeWidth="1.5" opacity="0.5" />

          {/* Driver coupling half */}
          <rect x="60" y="26" width="18" height="28" rx="3" fill={couplingColor} stroke="#134f60" strokeWidth="1.5" />
          {/* Coupling bolts */}
          <circle cx="69" cy="30" r="2" fill="#134f60" />
          <circle cx="69" cy="50" r="2" fill="#134f60" />

          {/* Gap */}
          <rect x="78" y="32" width="4" height="16" fill="#F4F8FB" />

          {/* Driven coupling half */}
          <rect x="82" y="26" width="18" height="28" rx="3" fill={couplingColor} stroke="#134f60" strokeWidth="1.5" />
          <circle cx="91" cy="30" r="2" fill="#134f60" />
          <circle cx="91" cy="50" r="2" fill="#134f60" />

          {/* Angular misalignment arrow */}
          <path d="M 55 20 Q 80 14 105 20" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrowRed)" />
          {/* Offset misalignment arrow */}
          <line x1="80" y1="22" x2="80" y2="56" stroke="#1E90FF" strokeWidth="1.5" strokeDasharray="3,2" />
          <polygon points="77,22 83,22 80,16" fill="#1E90FF" />

          {/* Legend */}
          <line x1="115" y1="18" x2="125" y2="18" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4,2" />
          <text x="128" y="21" fontSize="7" fill="#EF4444">Angular</text>
          <line x1="115" y1="28" x2="125" y2="28" stroke="#1E90FF" strokeWidth="1.5" strokeDasharray="3,2" />
          <text x="128" y="31" fontSize="7" fill="#1E90FF">Offset</text>

          {/* Coupling label */}
          <text x="80" y="70" textAnchor="middle" fontSize="8" fill="#1B6F82" fontWeight="600">COUPLING</text>
        </svg>
      </div>

      {/* Driven Equipment */}
      <div style={{ textAlign: "center", minWidth: "130px" }}>
        <svg viewBox="0 0 80 80" width="120" height="100">
          {getShape(drivenType)}
        </svg>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#1f2937", marginTop: "2px", lineHeight: 1.2 }}>{drivenLabel}</div>
        <div style={{ fontSize: "10px", color: "#6B7280", fontWeight: 600, letterSpacing: "0.04em" }}>DRIVEN</div>
      </div>
    </div>
  );
}

export default function AlignmentPDFTemplate({ report, branding }: AlignmentPDFTemplateProps) {
  const vertPassBefore =
    report.before.offsetVertical <= report.toleranceOffsetMax &&
    report.before.angularVertical <= report.toleranceAngleMax;
  const horizPassBefore =
    report.before.offsetHorizontal <= report.toleranceOffsetMax &&
    report.before.angularHorizontal <= report.toleranceAngleMax;
  const vertPassAfter =
    report.after.offsetVertical <= report.toleranceOffsetMax &&
    report.after.angularVertical <= report.toleranceAngleMax;
  const horizPassAfter =
    report.after.offsetHorizontal <= report.toleranceOffsetMax &&
    report.after.angularHorizontal <= report.toleranceAngleMax;

  const overallPass = vertPassAfter && horizPassAfter;

  const cell: React.CSSProperties = {
    border: "1px solid #CBD5E1",
    padding: "5px 8px",
    fontSize: "11px",
    color: "#1f2937",
  };

  const thCell: React.CSSProperties = {
    ...cell,
    background: "#1B6F82",
    color: "white",
    fontWeight: 700,
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  const labelCell: React.CSSProperties = {
    ...cell,
    fontWeight: 600,
    background: "#F1F5F9",
    width: "120px",
  };

  return (
    <div
      id="alignment-pdf-content"
      style={{
        width: "794px",
        minHeight: "1123px",
        background: "#F4F8FB",
        fontFamily: "Arial, sans-serif",
        color: "#1f2937",
        padding: "30px 36px",
        boxSizing: "border-box",
        fontSize: "12px",
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {branding.logo ? (
            <img src={branding.logo} alt="logo" style={{ width: "60px", height: "60px", objectFit: "contain" }} />
          ) : (
            <div style={{
              width: "60px", height: "60px", borderRadius: "8px",
              background: "#1B6F82", display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: "18px",
            }}>
              {(branding.companyName || "TC").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937", lineHeight: 1.2 }}>
              {branding.companyName || "TechBal Engineering"}
            </div>
            {branding.phone && <div style={{ fontSize: "10px", color: "#6B7280" }}>📞 {branding.phone}</div>}
            {branding.email && <div style={{ fontSize: "10px", color: "#6B7280" }}>✉ {branding.email}</div>}
            {branding.website && <div style={{ fontSize: "10px", color: "#6B7280" }}>🌐 {branding.website}</div>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#1B6F82", lineHeight: 1.1, textTransform: "uppercase" }}>
            Shaft Alignment Report
          </div>
          <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>
            {new Date(report.alignmentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase()}
          </div>
          <div style={{
            fontSize: "11px", fontFamily: "monospace", fontWeight: 700, color: "#1B6F82",
            background: "#E8F4F8", padding: "2px 8px", borderRadius: "4px", marginTop: "4px", display: "inline-block"
          }}>
            {report.caseId}
          </div>
        </div>
      </div>

      <div style={{ borderBottom: "3px solid #1B6F82", marginBottom: "14px" }} />

      {/* ── PROJECT INFO TABLE ── */}
      <div style={{ fontSize: "12px", fontWeight: 700, color: "#1B6F82", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {report.projectName || "Alignment Job Details"}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
        <tbody>
          <tr>
            <td style={labelCell}>Driver Equipment</td>
            <td style={cell}>{report.driverName} ({EQUIPMENT_LABELS[report.driverType]})</td>
            <td style={labelCell}>Technician</td>
            <td style={cell}>{report.technicianName}</td>
          </tr>
          <tr>
            <td style={labelCell}>Driven Equipment</td>
            <td style={cell}>{report.drivenName} ({EQUIPMENT_LABELS[report.drivenType]})</td>
            <td style={labelCell}>Date</td>
            <td style={cell}>{report.alignmentDate}</td>
          </tr>
          <tr>
            <td style={labelCell}>Location</td>
            <td style={cell}>{report.location}</td>
            <td style={labelCell}>Method</td>
            <td style={cell}>{METHOD_LABELS[report.alignmentMethod] || report.alignmentMethod}</td>
          </tr>
          <tr>
            <td style={labelCell}>Equipment Tag</td>
            <td style={cell}>{report.equipmentTag}</td>
            <td style={labelCell}>Customer</td>
            <td style={cell}>{report.customerName}</td>
          </tr>
          <tr>
            <td style={labelCell}>RPM</td>
            <td style={cell}>{report.rpm}</td>
            <td style={labelCell}>Coupling Type</td>
            <td style={cell}>{report.couplingType || "—"}</td>
          </tr>
        </tbody>
      </table>

      {/* ── EQUIPMENT DIAGRAM ── */}
      <div style={{
        border: "1px solid #CBD5E1", borderRadius: "6px", padding: "10px 16px",
        background: "white", marginBottom: "14px"
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#1B6F82", marginBottom: "6px", textTransform: "uppercase" }}>
          Equipment Configuration
        </div>
        <EquipmentDiagram
          driverLabel={report.driverName}
          drivenLabel={report.drivenName}
          driverType={report.driverType}
          drivenType={report.drivenType}
        />
      </div>

      {/* ── MEASUREMENT RESULTS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
        {/* BEFORE */}
        <div>
          <div style={{ background: "#F59E0B", color: "white", fontWeight: 700, fontSize: "11px", padding: "5px 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            BEFORE — Misalignment Readings
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...thCell, background: "#374151", width: "40%" }}> </th>
                <th style={{ ...thCell, background: "#374151" }}>Vertical</th>
                <th style={{ ...thCell, background: "#374151" }}>Horizontal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={labelCell}>Angular (mm/100mm)</td>
                <td style={{ ...cell, textAlign: "center", fontFamily: "monospace" }}>{report.before.angularVertical}</td>
                <td style={{ ...cell, textAlign: "center", fontFamily: "monospace" }}>{report.before.angularHorizontal}</td>
              </tr>
              <tr>
                <td style={labelCell}>Offset (mm)</td>
                <td style={{ ...cell, textAlign: "center", fontFamily: "monospace" }}>{report.before.offsetVertical}</td>
                <td style={{ ...cell, textAlign: "center", fontFamily: "monospace" }}>{report.before.offsetHorizontal}</td>
              </tr>
              <tr>
                <td style={labelCell}>Status</td>
                <PassFailCell pass={vertPassBefore} />
                <PassFailCell pass={horizPassBefore} />
              </tr>
            </tbody>
          </table>
        </div>

        {/* AFTER */}
        <div>
          <div style={{ background: "#16a34a", color: "white", fontWeight: 700, fontSize: "11px", padding: "5px 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            AFTER — Corrected Readings
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...thCell, background: "#374151", width: "40%" }}> </th>
                <th style={{ ...thCell, background: "#374151" }}>Vertical</th>
                <th style={{ ...thCell, background: "#374151" }}>Horizontal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={labelCell}>Angular (mm/100mm)</td>
                <td style={{ ...cell, textAlign: "center", fontFamily: "monospace" }}>{report.after.angularVertical}</td>
                <td style={{ ...cell, textAlign: "center", fontFamily: "monospace" }}>{report.after.angularHorizontal}</td>
              </tr>
              <tr>
                <td style={labelCell}>Offset (mm)</td>
                <td style={{ ...cell, textAlign: "center", fontFamily: "monospace" }}>{report.after.offsetVertical}</td>
                <td style={{ ...cell, textAlign: "center", fontFamily: "monospace" }}>{report.after.offsetHorizontal}</td>
              </tr>
              <tr>
                <td style={labelCell}>Status</td>
                <PassFailCell pass={vertPassAfter} />
                <PassFailCell pass={horizPassAfter} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TOLERANCE TABLE ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
        <thead>
          <tr>
            <th style={thCell}>Tolerance Type</th>
            <th style={thCell}>Target</th>
            <th style={thCell}>Before (Vert)</th>
            <th style={thCell}>Before (Horiz)</th>
            <th style={thCell}>After (Vert)</th>
            <th style={thCell}>After (Horiz)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={labelCell}>Max Offset (mm)</td>
            <td style={{ ...cell, textAlign: "center", fontFamily: "monospace" }}>
              &lt; {report.toleranceOffsetMax}
            </td>
            <td style={{ ...cell, textAlign: "center", fontFamily: "monospace", color: report.before.offsetVertical > report.toleranceOffsetMax ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
              {report.before.offsetVertical}
            </td>
            <td style={{ ...cell, textAlign: "center", fontFamily: "monospace", color: report.before.offsetHorizontal > report.toleranceOffsetMax ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
              {report.before.offsetHorizontal}
            </td>
            <td style={{ ...cell, textAlign: "center", fontFamily: "monospace", color: report.after.offsetVertical > report.toleranceOffsetMax ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
              {report.after.offsetVertical}
            </td>
            <td style={{ ...cell, textAlign: "center", fontFamily: "monospace", color: report.after.offsetHorizontal > report.toleranceOffsetMax ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
              {report.after.offsetHorizontal}
            </td>
          </tr>
          <tr>
            <td style={labelCell}>Max Angle (mm/100mm)</td>
            <td style={{ ...cell, textAlign: "center", fontFamily: "monospace" }}>
              &lt; {report.toleranceAngleMax}
            </td>
            <td style={{ ...cell, textAlign: "center", fontFamily: "monospace", color: report.before.angularVertical > report.toleranceAngleMax ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
              {report.before.angularVertical}
            </td>
            <td style={{ ...cell, textAlign: "center", fontFamily: "monospace", color: report.before.angularHorizontal > report.toleranceAngleMax ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
              {report.before.angularHorizontal}
            </td>
            <td style={{ ...cell, textAlign: "center", fontFamily: "monospace", color: report.after.angularVertical > report.toleranceAngleMax ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
              {report.after.angularVertical}
            </td>
            <td style={{ ...cell, textAlign: "center", fontFamily: "monospace", color: report.after.angularHorizontal > report.toleranceAngleMax ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
              {report.after.angularHorizontal}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FINAL STATUS BANNER ── */}
      <div style={{
        background: overallPass ? "#16a34a" : "#dc2626",
        color: "white",
        padding: "10px 20px",
        borderRadius: "6px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "14px",
      }}>
        <div style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "0.05em" }}>
          OVERALL ALIGNMENT STATUS: {overallPass ? "✓ ACCEPTABLE — WITHIN TOLERANCE" : "✗ NOT ACCEPTABLE — OUT OF TOLERANCE"}
        </div>
        <div style={{ fontSize: "12px", opacity: 0.85 }}>
          Shim: {report.shimAdded || "N/A"}
        </div>
      </div>

      {/* ── SERVICE NOTES ── */}
      {(report.serviceRemarks || report.recommendations) && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
          <thead>
            <tr>
              <th style={{ ...thCell, width: "50%" }}>Service Remarks</th>
              <th style={thCell}>Recommendations</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...cell, verticalAlign: "top", minHeight: "50px" }}>{report.serviceRemarks || "—"}</td>
              <td style={{ ...cell, verticalAlign: "top" }}>{report.recommendations || "—"}</td>
            </tr>
          </tbody>
        </table>
      )}

      {/* ── FOOTER ── */}
      <div style={{
        borderTop: "2px solid #1B6F82",
        paddingTop: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#6B7280",
        fontSize: "9px",
      }}>
        <span>{branding.companyName || "TechBal Engineering"} — Shaft Alignment Report</span>
        <span style={{ fontFamily: "monospace" }}>{report.caseId}</span>
        <span>{branding.website || ""}</span>
      </div>
    </div>
  );
}

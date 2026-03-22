import { Report, CompanyBranding } from "@/types/report";
import { calcReduction } from "@/lib/storage";
import { QRCodeSVG } from "qrcode.react";

interface PDFTemplateProps {
  report: Report;
  branding: CompanyBranding;
}

const statusLabels = {
  completed: "COMPLETED & IMPRESSIVE",
  pending: "PENDING",
};

function FanDiagramSVG({ angle, weight, accentColor = "#00C9A7", label }: { angle: number; weight: number; accentColor?: string; label?: string }) {
  const cx = 80;
  const cy = 80;
  const r = 55;
  const markerR = r - 8;
  const angleRad = ((angle - 90) * Math.PI) / 180;
  const markerX = cx + markerR * Math.cos(angleRad);
  const markerY = cy + markerR * Math.sin(angleRad);
  const blades = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 * Math.PI) / 180;
    const x1 = cx + 14 * Math.cos(a);
    const y1 = cy + 14 * Math.sin(a);
    const x2 = cx + 45 * Math.cos(a - 0.3);
    const y2 = cy + 45 * Math.sin(a - 0.3);
    const x3 = cx + 45 * Math.cos(a + 0.3);
    const y3 = cy + 45 * Math.sin(a + 0.3);
    return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      {label && (
        <div style={{ fontSize: "9px", fontWeight: "800", color: accentColor, letterSpacing: "0.06em", textAlign: "center" }}>
          {label}
        </div>
      )}
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke="#CBD5E1" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={r} fill="#E8F4FB" stroke="#94A3B8" strokeWidth="1" />
        {blades.map((d, i) => (
          <path key={i} d={d} fill="#1E3A5F" stroke="#2A5A8A" strokeWidth="0.5" opacity="0.6" />
        ))}
        <circle cx={cx} cy={cy} r={10} fill="#162032" stroke="#1E3A5F" strokeWidth="1" />
        <line x1={cx} y1={cy - r - 8} x2={cx} y2={cy - r + 3} stroke="#94A3B8" strokeWidth="1" />
        <text x={cx} y={cy - r - 10} textAnchor="middle" fill="#4A6B8A" fontSize="8" fontFamily="monospace">I</text>
        {angle > 0 && (
          <path
            d={`M ${cx} ${cy - (markerR)} A ${markerR} ${markerR} 0 ${angle > 180 ? 1 : 0} 1 ${cx + markerR * Math.cos(angleRad)} ${cy + markerR * Math.sin(angleRad)}`}
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeDasharray="3 2"
            opacity="0.7"
          />
        )}
        <circle cx={markerX} cy={markerY} r={7} fill={accentColor} stroke="white" strokeWidth="1.5" />
        <circle cx={markerX} cy={markerY} r={3} fill="white" />
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "8px", color: "#4A6B8A", fontWeight: "600", letterSpacing: "0.05em" }}>
          CORRECTION WEIGHT:
        </div>
        <div style={{ fontSize: "16px", fontWeight: "900", color: "#1a1a2e", lineHeight: 1 }}>
          {weight || 0}g
        </div>
        <div style={{ fontSize: "8px", color: "#4A6B8A", fontWeight: "600", letterSpacing: "0.05em", marginTop: "3px" }}>
          ADDING ANGLE:
        </div>
        <div style={{ fontSize: "16px", fontWeight: "900", color: accentColor, lineHeight: 1 }}>
          {angle || 0}°
        </div>
      </div>
    </div>
  );
}

export default function PDFTemplate({ report, branding }: PDFTemplateProps) {
  const avgReduction =
    report.measurementPoints.length > 0
      ? report.measurementPoints.reduce(
          (acc, p) => acc + calcReduction(p.preBalancing, p.postBalancing),
          0
        ) / report.measurementPoints.length
      : 0;

  const isDual = report.balancingMethod === "dual";

  // Per-point bar chart
  const maxValue = Math.max(
    ...report.measurementPoints.map((p) => Math.max(p.preBalancing, p.postBalancing)),
    1
  );
  const barMaxH = 70;

  // QR code URL - links to the report's online view (public, no login required)
  const reportUrl = `${window.location.origin}/?report=${report.caseId}`;

  return (
    <div
      id="pdf-template"
      style={{
        width: "794px",
        minHeight: "1123px",
        background: "#F4F8FB",
        fontFamily: "'Arial', sans-serif",
        fontSize: "12px",
        color: "#1a1a2e",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          {branding.logo ? (
            <img src={branding.logo} alt="logo" style={{ height: "50px", marginBottom: "4px" }} />
          ) : (
            <div style={{
              background: "linear-gradient(135deg, #00C9A7, #1E90FF)",
              borderRadius: "8px",
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "4px",
            }}>
              <span style={{ color: "#0D1B2A", fontWeight: "900", fontSize: "16px" }}>TB</span>
            </div>
          )}
          <div style={{ fontSize: "11px", color: "#4A6B8A", marginTop: "2px" }}>{branding.companyName}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#1a1a2e", lineHeight: 1 }}>
            {report.equipmentName?.toUpperCase() || "EQUIPMENT NAME"}
          </div>
          <div style={{
            fontSize: "14px",
            fontWeight: "700",
            color: "#00C9A7",
            letterSpacing: "0.1em",
            marginTop: "2px",
          }}>
            DYNAMIC BALANCING REPORT
          </div>
          <div style={{ fontSize: "10px", color: "#4A6B8A", fontFamily: "monospace", marginTop: "2px" }}>
            Case ID: {report.caseId}
          </div>
        </div>
      </div>

      {/* Equipment & Customer Info Grid — Extended */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        border: "2px solid #0D1B2A",
        borderRadius: "6px",
        overflow: "hidden",
        marginBottom: "4px",
      }}>
        {[
          { label: "EQUIPMENT NAME:", value: report.equipmentName },
          { label: "EQUIPMENT ID / TAG:", value: report.equipmentId },
          { label: "STATUS:", isStatus: true },
        ].map((item, i) => (
          <div key={i} style={{
            padding: "8px 12px",
            borderRight: i < 2 ? "2px solid #0D1B2A" : "none",
            background: (item as { isStatus?: boolean }).isStatus ? "#22C55E" : "#E8F4FB",
          }}>
            <div style={{ fontSize: "9px", fontWeight: "700", color: (item as { isStatus?: boolean }).isStatus ? "white" : "#4A6B8A", letterSpacing: "0.05em" }}>
              {item.label}
            </div>
            {(item as { isStatus?: boolean }).isStatus ? (
              <div style={{ fontSize: "11px", fontWeight: "900", color: "white", marginTop: "2px" }}>
                {statusLabels[report.status]}
              </div>
            ) : (
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a2e", marginTop: "2px" }}>
                {item.value || "—"}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Details Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        border: "2px solid #0D1B2A",
        borderTop: "none",
        borderRadius: "0 0 6px 6px",
        overflow: "hidden",
        marginBottom: "12px",
      }}>
        {[
          { label: "CUSTOMER NAME:", value: report.customerName },
          { label: "LOCATION / PLANT:", value: report.location },
          { label: "TECHNICIAN:", value: report.technicianName },
          { label: "BALANCING DATE:", value: report.balancingDate },
        ].map((item, i) => (
          <div key={i} style={{
            padding: "7px 12px",
            borderRight: i < 3 ? "2px solid #0D1B2A" : "none",
            background: "#FFFFFF",
          }}>
            <div style={{ fontSize: "8px", fontWeight: "700", color: "#4A6B8A", letterSpacing: "0.05em" }}>
              {item.label}
            </div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#1a1a2e", marginTop: "1px" }}>
              {item.value || "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Balancing Parameters */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{
          background: "#00C9A7",
          color: "white",
          fontWeight: "800",
          fontSize: "11px",
          letterSpacing: "0.08em",
          padding: "6px 12px",
          borderRadius: "4px 4px 0 0",
          textAlign: "center",
        }}>
          BALANCING PARAMETERS
        </div>
        <div style={{
          border: "1px solid #CBD5E1",
          borderTop: "none",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderRadius: "0 0 4px 4px",
          overflow: "hidden",
        }}>
          {[
            { l: "Method:", v: isDual ? "Dual-Plane Field Balancing" : "Single-Plane Field Balancing" },
            { l: "Reference Point:", v: report.referencePoint || "Shaft Keyway" },
            { l: "RPM:", v: report.rpm ? `${report.rpm} RPM` : "—" },
            { l: "Trial Weight:", v: report.trialWeight ? `${report.trialWeight}g at ${report.trialAngle}°` : "—" },
            { l: "Machine Type:", v: report.machineType ? report.machineType.charAt(0).toUpperCase() + report.machineType.slice(1) : "—" },
            { l: "Avg. Reduction:", v: avgReduction > 0 ? `${avgReduction.toFixed(1)}%` : "—" },
          ].map((item, i) => (
            <div key={i} style={{
              padding: "7px 12px",
              borderBottom: i < 3 ? "1px solid #CBD5E1" : "none",
              borderRight: i % 3 !== 2 ? "1px solid #CBD5E1" : "none",
              background: "#FFFFFF",
            }}>
              <span style={{ fontSize: "9px", color: "#4A6B8A" }}>{item.l} </span>
              <span style={{ fontWeight: "700", color: "#1a1a2e", fontSize: "11px" }}>{item.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vibration Reduction Summary — Per-Point Bar Chart */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{
          background: "#1E90FF",
          color: "white",
          fontWeight: "800",
          fontSize: "11px",
          letterSpacing: "0.08em",
          padding: "6px 12px",
          borderRadius: "4px 4px 0 0",
          textAlign: "center",
        }}>
          VIBRATION REDUCTION SUMMARY — ALL MEASUREMENT POINTS
        </div>
        <div style={{
          border: "1px solid #CBD5E1",
          borderTop: "none",
          borderRadius: "0 0 4px 4px",
          overflow: "hidden",
          background: "#FFFFFF",
          padding: "16px",
        }}>
          {report.measurementPoints.length > 0 ? (
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "12px", height: "120px", paddingBottom: "24px", position: "relative" }}>
              {report.measurementPoints.map((p, i) => {
                const preH = maxValue > 0 ? Math.max((p.preBalancing / maxValue) * barMaxH, 4) : 4;
                const postH = maxValue > 0 ? Math.max((p.postBalancing / maxValue) * barMaxH, 4) : 4;
                const red = calcReduction(p.preBalancing, p.postBalancing);
                return (
                  <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0px", minWidth: "60px" }}>
                    <div style={{ fontSize: "8px", fontWeight: "700", color: "#00C9A7", marginBottom: "2px" }}>
                      {red.toFixed(0)}%↓
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "3px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ fontSize: "8px", fontWeight: "700", color: "#EF4444", marginBottom: "2px" }}>
                          {p.preBalancing}
                        </div>
                        <div style={{
                          width: "22px",
                          height: `${preH}px`,
                          background: "linear-gradient(to bottom, #EF4444, #F97316)",
                          borderRadius: "2px 2px 0 0",
                        }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ fontSize: "8px", fontWeight: "700", color: "#22C55E", marginBottom: "2px" }}>
                          {p.postBalancing}
                        </div>
                        <div style={{
                          width: "22px",
                          height: `${postH}px`,
                          background: "linear-gradient(to bottom, #22C55E, #16A34A)",
                          borderRadius: "2px 2px 0 0",
                        }} />
                      </div>
                    </div>
                    <div style={{ fontSize: "7px", color: "#4A6B8A", fontWeight: "600", marginTop: "4px", textAlign: "center", maxWidth: "70px", lineHeight: 1.2 }}>
                      {p.pointName || `Point ${i + 1}`} {p.direction}
                    </div>
                  </div>
                );
              })}

              {/* Average reduction badge */}
              <div style={{
                position: "absolute",
                top: "0",
                right: "0",
                background: "#E8F4FB",
                border: "1px solid #00C9A7",
                borderRadius: "6px",
                padding: "4px 10px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "7px", color: "#4A6B8A", fontWeight: "600" }}>AVG REDUCTION</div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#00C9A7", lineHeight: 1 }}>
                  {avgReduction.toFixed(1)}%
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px", color: "#9CA3AF", fontSize: "10px" }}>
              No measurement data
            </div>
          )}
          {/* Legend */}
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "8px", borderTop: "1px solid #E5E7EB", paddingTop: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "12px", height: "8px", background: "linear-gradient(to bottom, #EF4444, #F97316)", borderRadius: "2px" }} />
              <span style={{ fontSize: "8px", color: "#4A6B8A", fontWeight: "600" }}>Before Balancing</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "12px", height: "8px", background: "linear-gradient(to bottom, #22C55E, #16A34A)", borderRadius: "2px" }} />
              <span style={{ fontSize: "8px", color: "#4A6B8A", fontWeight: "600" }}>After Balancing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Measurement Table & Correction Details */}
      <div style={{ display: "grid", gridTemplateColumns: isDual ? "1fr 1fr" : "1.2fr 0.8fr", gap: "12px", marginBottom: "12px" }}>
        {/* Measurement Table */}
        <div>
          <div style={{
            background: "#1E90FF",
            color: "white",
            fontWeight: "800",
            fontSize: "10px",
            letterSpacing: "0.06em",
            padding: "5px 10px",
            borderRadius: "4px 4px 0 0",
            textAlign: "center",
          }}>
            VIBRATION LEVELS (mm/s RMS) BEFORE vs AFTER
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
            <thead>
              <tr style={{ background: "#E8F4FB" }}>
                {["MEASUREMENT POINT", "DIRECTION", "PRE-BAL", "POST-BAL", "REDUCTION"].map((h) => (
                  <th key={h} style={{
                    padding: "5px 6px",
                    border: "1px solid #CBD5E1",
                    fontWeight: "700",
                    color: "#1a1a2e",
                    textAlign: "center",
                    fontSize: "8px",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.measurementPoints.length > 0 ? (
                report.measurementPoints.map((p, i) => {
                  const red = calcReduction(p.preBalancing, p.postBalancing);
                  return (
                    <tr key={p.id} style={{ background: i % 2 === 0 ? "#FFFFFF" : "#F8FAFC" }}>
                      <td style={{ padding: "5px 6px", border: "1px solid #CBD5E1", textAlign: "center" }}>{p.pointName || `Point ${i + 1}`}</td>
                      <td style={{ padding: "5px 6px", border: "1px solid #CBD5E1", textAlign: "center" }}>{p.direction === "H" ? "Horizontal" : p.direction === "V" ? "Vertical" : "Axial"}</td>
                      <td style={{ padding: "5px 6px", border: "1px solid #CBD5E1", textAlign: "center", fontWeight: "700", color: "#EF4444" }}>{p.preBalancing}</td>
                      <td style={{ padding: "5px 6px", border: "1px solid #CBD5E1", textAlign: "center", fontWeight: "700", color: "#22C55E" }}>{p.postBalancing}</td>
                      <td style={{ padding: "5px 6px", border: "1px solid #CBD5E1", textAlign: "center", fontWeight: "700", color: "#00C9A7" }}>{red.toFixed(1)}%</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "10px", textAlign: "center", color: "#9CA3AF" }}>No measurement data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Correction Details */}
        <div>
          <div style={{
            background: "#22C55E",
            color: "white",
            fontWeight: "800",
            fontSize: "10px",
            letterSpacing: "0.06em",
            padding: "5px 10px",
            borderRadius: "4px 4px 0 0",
            textAlign: "center",
          }}>
            CORRECTION DETAILS {isDual ? "— DUAL PLANE" : ""}
          </div>
          <div style={{
            border: "1px solid #CBD5E1",
            borderTop: "none",
            borderRadius: "0 0 4px 4px",
            padding: "12px",
            background: "#FFFFFF",
            display: "flex",
            flexDirection: isDual ? "row" : "column",
            alignItems: "center",
            gap: isDual ? "12px" : "8px",
            justifyContent: "center",
          }}>
            {isDual ? (
              <>
                <FanDiagramSVG
                  angle={report.finalAngle}
                  weight={report.finalCorrectionWeight}
                  accentColor="#00C9A7"
                  label="PLANE 1"
                />
                <div style={{ width: "1px", background: "#CBD5E1", alignSelf: "stretch" }} />
                <FanDiagramSVG
                  angle={report.finalAngle2}
                  weight={report.finalCorrectionWeight2}
                  accentColor="#1E90FF"
                  label="PLANE 2"
                />
              </>
            ) : (
              <FanDiagramSVG
                angle={report.finalAngle}
                weight={report.finalCorrectionWeight}
                accentColor="#00C9A7"
              />
            )}
          </div>
        </div>
      </div>

      {/* Service Notes */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{
          background: "#1E3A5F",
          color: "white",
          fontWeight: "800",
          fontSize: "10px",
          letterSpacing: "0.06em",
          padding: "5px 10px",
          borderRadius: "4px 4px 0 0",
          textAlign: "center",
        }}>
          SERVICE NOTES & RECOMMENDATIONS
        </div>
        <div style={{
          border: "1px solid #CBD5E1",
          borderTop: "none",
          borderRadius: "0 0 4px 4px",
          padding: "10px 12px",
          background: "#FFFFFF",
          minHeight: "60px",
        }}>
          <p style={{ fontSize: "10px", color: "#374151", lineHeight: 1.6 }}>
            {report.serviceRemarks || "No service remarks provided."}
          </p>
          {report.recommendations && (
            <p style={{ fontSize: "10px", color: "#374151", lineHeight: 1.6, marginTop: "6px" }}>
              <strong>Recommendations:</strong> {report.recommendations}
            </p>
          )}
          {report.customerAcknowledgment && (
            <p style={{ fontSize: "9px", color: "#4A6B8A", marginTop: "8px" }}>
              Customer Acknowledgment: <strong>{report.customerAcknowledgment}</strong>
            </p>
          )}
        </div>
      </div>

      {/* QR Code Verification Section */}
      <div style={{
        border: "1px solid #CBD5E1",
        borderRadius: "6px",
        padding: "12px 16px",
        marginBottom: "16px",
        background: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: "10px", fontWeight: "800", color: "#1a1a2e", letterSpacing: "0.06em", marginBottom: "4px" }}>
            📱 SCAN TO DOWNLOAD THIS REPORT
          </div>
          <div style={{ fontSize: "9px", color: "#4A6B8A", lineHeight: 1.5, maxWidth: "400px" }}>
            Scan this QR code with your mobile device to directly download and verify this balancing report.
            No login required — instant access to the complete report with all measurement data.
          </div>
          <div style={{ fontSize: "8px", color: "#94A3B8", fontFamily: "monospace", marginTop: "4px" }}>
            Report ID: {report.caseId} • Generated: {new Date(report.updatedAt || report.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div style={{
          background: "white",
          padding: "8px",
          borderRadius: "6px",
          border: "2px solid #0D1B2A",
          flexShrink: 0,
        }}>
          <QRCodeSVG
            value={reportUrl}
            size={80}
            bgColor="#FFFFFF"
            fgColor="#0D1B2A"
            level="M"
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "2px solid #0D1B2A",
        paddingTop: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ display: "flex", gap: "16px" }}>
          {["SMOOTH OPERATION", "SMOOTH RELIABILITY", "SMOOTH & LONGEVITY"].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{
                width: "16px", height: "16px",
                borderRadius: "50%",
                background: "#00C9A7",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "white", fontSize: "8px", fontWeight: "700" }}>✓</span>
              </div>
              <span style={{ fontSize: "7px", fontWeight: "700", color: "#1a1a2e", letterSpacing: "0.04em" }}>{t}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "right", display: "flex", gap: "12px", fontSize: "9px", color: "#4A6B8A" }}>
          <span>📞 {branding.phone}</span>
          <span>🌐 {branding.website}</span>
          <span>✉ {branding.email}</span>
        </div>
      </div>
    </div>
  );
}

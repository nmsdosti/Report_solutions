import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Report, MeasurementPoint } from "@/types/report";
import { calcReduction } from "@/lib/storage";
import FanDiagram from "./FanDiagram";

interface Step4Props {
  data: Partial<Report>;
  points: MeasurementPoint[];
  onAngleChange: (angle: number) => void;
  onAngle2Change: (angle: number) => void;
}

export default function Step4Visualization({ data, points, onAngleChange, onAngle2Change }: Step4Props) {
  const avgReduction =
    points.length > 0
      ? points.reduce((acc, p) => acc + calcReduction(p.preBalancing, p.postBalancing), 0) / points.length
      : 0;

  // Build per-point chart data showing each measurement point's before & after
  const barData = points.map((p, i) => ({
    name: `${p.pointName || `Pt ${i + 1}`} ${p.direction}`,
    Before: p.preBalancing,
    After: p.postBalancing,
  }));

  const isDual = data.balancingMethod === "dual";

  return (
    <div className="space-y-6">
      {/* Bar Chart - All Measurement Points */}
      <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-sm">VIBRATION LEVELS — ALL MEASUREMENT POINTS</h3>
            <p className="text-[#4A6B8A] text-xs">mm/s RMS — Before vs After per point</p>
          </div>
          {avgReduction > 0 && (
            <div className="text-right">
              <div className="text-[#4A6B8A] text-[10px] font-semibold tracking-wider">AVG REDUCTION</div>
              <div className="text-[#00C9A7] text-2xl font-black">{avgReduction.toFixed(1)}%</div>
            </div>
          )}
        </div>

        {points.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(220, points.length * 30 + 80)}>
            <BarChart data={barData} barGap={2} barCategoryGap="20%">
              <defs>
                <linearGradient id="beforeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
                <linearGradient id="afterGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#16A34A" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#4A6B8A", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fill: "#4A6B8A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#162032", border: "1px solid #1E3A5F", borderRadius: 8 }}
                labelStyle={{ color: "#8BA8C4", fontSize: 11 }}
                itemStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "#8BA8C4" }} />
              <Bar dataKey="Before" fill="url(#beforeGradient)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="After" fill="url(#afterGradient)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-[#2A4A6A] text-sm">
            Add vibration data in Step 2 to see the chart
          </div>
        )}
      </div>

      {/* Fan Diagram - Plane 1 */}
      <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#00C9A7]" />
          <h3 className="text-white font-bold text-sm">
            {isDual ? "PLANE 1 — CORRECTION DETAILS" : "CORRECTION DETAILS — FAN DIAGRAM"}
          </h3>
        </div>
        <FanDiagram
          angle={data.finalAngle || 0}
          weight={data.finalCorrectionWeight || 0}
          onAngleChange={onAngleChange}
          accentColor="#00C9A7"
          label={isDual ? "Plane 1" : undefined}
        />
      </div>

      {/* Fan Diagram - Plane 2 (Dual Plane only) */}
      {isDual && (
        <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#1E90FF]" />
            <h3 className="text-white font-bold text-sm">PLANE 2 — CORRECTION DETAILS</h3>
          </div>
          <FanDiagram
            angle={data.finalAngle2 || 0}
            weight={data.finalCorrectionWeight2 || 0}
            onAngleChange={onAngle2Change}
            accentColor="#1E90FF"
            label="Plane 2"
          />
        </div>
      )}
    </div>
  );
}

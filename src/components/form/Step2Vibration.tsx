import { Plus, Trash2, TrendingDown } from "lucide-react";
import { MeasurementPoint } from "@/types/report";
import { calcReduction, getImprovementStatus } from "@/lib/storage";

interface Step2Props {
  points: MeasurementPoint[];
  onChange: (points: MeasurementPoint[]) => void;
}

const statusConfig = {
  excellent: { label: "EXCELLENT", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  good: { label: "GOOD", color: "text-[#00C9A7]", bg: "bg-[#00C9A7]/10 border-[#00C9A7]/20" },
  "needs-attention": { label: "NEEDS ATTENTION", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
};

export default function Step2Vibration({ points, onChange }: Step2Props) {
  const addRow = () => {
    onChange([
      ...points,
      {
        id: crypto.randomUUID(),
        pointName: "",
        direction: "H",
        preBalancing: 0,
        postBalancing: 0,
      },
    ]);
  };

  const removeRow = (id: string) => {
    onChange(points.filter((p) => p.id !== id));
  };

  const updateRow = (id: string, field: keyof MeasurementPoint, value: string | number) => {
    onChange(points.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const overallReduction =
    points.length > 0
      ? points.reduce((acc, p) => acc + calcReduction(p.preBalancing, p.postBalancing), 0) / points.length
      : 0;

  const overallStatus = getImprovementStatus(overallReduction);
  const statusCfg = statusConfig[overallStatus];

  return (
    <div className="space-y-5">
      {/* Summary card */}
      {points.length > 0 && overallReduction > 0 && (
        <div className={`flex items-center justify-between p-4 rounded-xl border ${statusCfg.bg}`}>
          <div>
            <div className="text-[#8BA8C4] text-xs font-semibold tracking-wider mb-1">
              AVERAGE VIBRATION REDUCTION
            </div>
            <div className={`text-3xl font-black ${statusCfg.color}`}>
              {overallReduction.toFixed(1)}%
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wider ${statusCfg.bg} ${statusCfg.color}`}>
            {statusCfg.label}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#1E3A5F]">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0D1B2A] border-b border-[#1E3A5F]">
              <th className="text-left text-[#4A6B8A] text-[10px] font-semibold tracking-wider px-4 py-3">
                POINT NAME
              </th>
              <th className="text-left text-[#4A6B8A] text-[10px] font-semibold tracking-wider px-3 py-3">
                DIR
              </th>
              <th className="text-left text-[#4A6B8A] text-[10px] font-semibold tracking-wider px-3 py-3">
                PRE (mm/s)
              </th>
              <th className="text-left text-[#4A6B8A] text-[10px] font-semibold tracking-wider px-3 py-3">
                POST (mm/s)
              </th>
              <th className="text-left text-[#4A6B8A] text-[10px] font-semibold tracking-wider px-3 py-3">
                REDUCTION
              </th>
              <th className="px-3 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {points.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[#2A4A6A] text-sm">
                  No measurement points. Add a row to get started.
                </td>
              </tr>
            ) : (
              points.map((point, i) => {
                const reduction = calcReduction(point.preBalancing, point.postBalancing);
                const status = getImprovementStatus(reduction);
                const reductionColor =
                  status === "excellent"
                    ? "text-green-400"
                    : status === "good"
                    ? "text-[#00C9A7]"
                    : "text-amber-400";

                return (
                  <tr
                    key={point.id}
                    className={`border-b border-[#1E3A5F] last:border-0 ${
                      i % 2 === 0 ? "bg-[#162032]" : "bg-[#0D1B2A]/50"
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={point.pointName}
                        onChange={(e) => updateRow(point.id, "pointName", e.target.value)}
                        placeholder="e.g. Bearing 1"
                        className="w-full bg-transparent border-0 text-white text-sm focus:outline-none placeholder-[#2A4A6A]"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={point.direction}
                        onChange={(e) => updateRow(point.id, "direction", e.target.value as "H" | "V" | "A")}
                        className="bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#00C9A7]"
                      >
                        <option value="H">H</option>
                        <option value="V">V</option>
                        <option value="A">A</option>
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        value={point.preBalancing || ""}
                        onChange={(e) => updateRow(point.id, "preBalancing", parseFloat(e.target.value) || 0)}
                        placeholder="0.0"
                        step="0.1"
                        min="0"
                        className="w-20 bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#00C9A7] text-right"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        value={point.postBalancing || ""}
                        onChange={(e) => updateRow(point.id, "postBalancing", parseFloat(e.target.value) || 0)}
                        placeholder="0.0"
                        step="0.1"
                        min="0"
                        className="w-20 bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#00C9A7] text-right"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      {reduction > 0 ? (
                        <div className="flex items-center gap-1">
                          <TrendingDown className={`w-3 h-3 ${reductionColor}`} />
                          <span className={`text-sm font-bold font-mono ${reductionColor}`}>
                            {reduction.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#2A4A6A] text-sm">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => removeRow(point.id)}
                        className="w-6 h-6 rounded flex items-center justify-center text-[#2A4A6A] hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={addRow}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#1E3A5F] text-[#4A6B8A] hover:text-[#00C9A7] hover:border-[#00C9A7]/50 text-sm font-medium transition-all w-full justify-center"
      >
        <Plus className="w-4 h-4" />
        Add Measurement Point
      </button>
    </div>
  );
}

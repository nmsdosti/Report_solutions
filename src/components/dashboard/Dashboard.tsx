import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  FileText,
  Clock,
  CheckCircle,
  CalendarDays,
  Settings,
  LogOut,
  Wind,
  Zap,
  Gauge,
  Droplets,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { Report, User } from "@/types/report";
import { storage } from "@/lib/storage";

interface DashboardProps {
  user: User;
  reports: Report[];
  onNewReport: () => void;
  onEditReport: (report: Report) => void;
  onDownloadPDF: (report: Report) => void;
  onDeleteReport: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onSettings: () => void;
  onLogout: () => void;
  onRefresh: () => void;
}

const machineIcons = {
  fan: Wind,
  blower: Gauge,
  motor: Zap,
  pump: Droplets,
};

const machineColors = {
  fan: "text-[#00C9A7]",
  blower: "text-[#1E90FF]",
  motor: "text-amber-400",
  pump: "text-purple-400",
};

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="tabular-nums"
    >
      {value}
    </motion.span>
  );
}

export default function Dashboard({
  user,
  reports,
  onNewReport,
  onEditReport,
  onDownloadPDF,
  onDeleteReport,
  onToggleStatus,
  onSettings,
  onLogout,
}: DashboardProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const thisMonth = useMemo(() => {
    const now = new Date();
    return reports.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [reports]);

  const stats = useMemo(() => ({
    total: reports.length,
    completed: reports.filter((r) => r.status === "completed").length,
    pending: reports.filter((r) => r.status === "pending").length,
    thisMonth,
  }), [reports, thisMonth]);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        r.caseId.toLowerCase().includes(q) ||
        r.equipmentName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.balancingDate.includes(q);
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      const matchType = typeFilter === "all" || r.machineType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [reports, search, statusFilter, typeFilter]);

  const statCards = [
    { label: "Total Reports", value: stats.total, icon: FileText, color: "from-[#00C9A7]/20 to-[#00C9A7]/5", border: "border-[#00C9A7]/20", iconColor: "text-[#00C9A7]" },
    { label: "Completed", value: stats.completed, icon: CheckCircle, color: "from-green-500/20 to-green-500/5", border: "border-green-500/20", iconColor: "text-green-400" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/20", iconColor: "text-amber-400" },
    { label: "This Month", value: stats.thisMonth, icon: CalendarDays, color: "from-[#1E90FF]/20 to-[#1E90FF]/5", border: "border-[#1E90FF]/20", iconColor: "text-[#1E90FF]" },
  ];

  return (
    <div className="min-h-screen bg-[#0D1B2A]" style={{
      backgroundImage: `linear-gradient(rgba(0,201,167,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,201,167,0.02) 1px, transparent 1px)`,
      backgroundSize: "40px 40px",
    }}>
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[#0D1B2A]/95 backdrop-blur border-b border-[#1E3A5F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00C9A7] to-[#1E90FF] flex items-center justify-center shadow-lg shadow-[#00C9A7]/20">
              <Zap className="w-5 h-5 text-[#0D1B2A]" />
            </div>
            <div>
              <div className="font-black text-white text-sm tracking-wider">TECHBAL</div>
              <div className="text-[#00C9A7] text-[10px] tracking-[0.2em] font-medium">BALANCING SUITE</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#162032] border border-[#1E3A5F] rounded-lg">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00C9A7] to-[#1E90FF] flex items-center justify-center text-[#0D1B2A] text-xs font-bold">
                {user.name[0].toUpperCase()}
              </div>
              <span className="text-[#8BA8C4] text-xs font-medium">{user.name}</span>
            </div>
            <button
              onClick={onSettings}
              className="w-9 h-9 rounded-lg bg-[#162032] border border-[#1E3A5F] flex items-center justify-center text-[#4A6B8A] hover:text-[#00C9A7] hover:border-[#00C9A7]/50 transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="w-9 h-9 rounded-lg bg-[#162032] border border-[#1E3A5F] flex items-center justify-center text-[#4A6B8A] hover:text-red-400 hover:border-red-400/50 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-xl p-4 bg-[#162032]`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${s.iconColor}`} />
                  <BarChart3 className="w-3 h-3 text-[#2A4A6A]" />
                </div>
                <div className="text-2xl font-black text-white mb-0.5">
                  <AnimatedNumber value={s.value} />
                </div>
                <div className="text-[#4A6B8A] text-xs font-medium">{s.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A6B8A]" />
            <input
              type="text"
              placeholder="Search by Case ID, equipment, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#162032] border border-[#1E3A5F] text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors placeholder-[#2A4A6A]"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="appearance-none bg-[#162032] border border-[#1E3A5F] text-[#8BA8C4] rounded-xl pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4A6B8A] pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none bg-[#162032] border border-[#1E3A5F] text-[#8BA8C4] rounded-xl pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="fan">Fan</option>
                <option value="blower">Blower</option>
                <option value="motor">Motor</option>
                <option value="pump">Pump</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4A6B8A] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Report Cards */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FileText className="w-12 h-12 text-[#1E3A5F] mx-auto mb-4" />
            <p className="text-[#4A6B8A] text-lg font-semibold">No reports found</p>
            <p className="text-[#2A4A6A] text-sm mt-1">
              {search ? "Try adjusting your search" : "Click + New Report to get started"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((report, i) => {
                const MachineIcon = machineIcons[report.machineType] || Wind;
                const iconColor = machineColors[report.machineType] || "text-[#00C9A7]";
                const avgReduction =
                  report.measurementPoints.length > 0
                    ? report.measurementPoints.reduce((acc, mp) => {
                        const r = mp.preBalancing > 0 ? ((mp.preBalancing - mp.postBalancing) / mp.preBalancing) * 100 : 0;
                        return acc + r;
                      }, 0) / report.measurementPoints.length
                    : 0;

                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-[#162032] border border-[#1E3A5F] hover:border-[#00C9A7]/40 rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-[#00C9A7]/5"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0D1B2A] border border-[#1E3A5F] flex items-center justify-center">
                          <MachineIcon className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm truncate max-w-[140px]">
                            {report.equipmentName || "Unnamed Equipment"}
                          </div>
                          <div className="text-[#00C9A7] text-[10px] font-mono tracking-wider">
                            {report.caseId}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onToggleStatus(report.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all ${
                          report.status === "completed"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                        }`}
                      >
                        {report.status === "completed" ? "COMPLETED" : "PENDING"}
                      </button>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#4A6B8A]">Customer</span>
                        <span className="text-[#8BA8C4] truncate max-w-[140px] text-right">
                          {report.customerName || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#4A6B8A]">Location</span>
                        <span className="text-[#8BA8C4] truncate max-w-[140px] text-right">
                          {report.location || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#4A6B8A]">Date</span>
                        <span className="text-[#8BA8C4]">
                          {report.balancingDate || "—"}
                        </span>
                      </div>
                      {avgReduction > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#4A6B8A]">Avg Reduction</span>
                          <span className={`font-bold font-mono ${
                            avgReduction >= 80 ? "text-green-400" :
                            avgReduction >= 50 ? "text-[#00C9A7]" : "text-amber-400"
                          }`}>
                            {avgReduction.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-[#1E3A5F]">
                      <button
                        onClick={() => onEditReport(report)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#0D1B2A] hover:bg-[#1E3A5F] text-[#8BA8C4] hover:text-white text-xs font-medium transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => onDownloadPDF(report)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#00C9A7]/10 hover:bg-[#00C9A7]/20 text-[#00C9A7] text-xs font-medium transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </button>
                      {deleteConfirm === report.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => { onDeleteReport(report.id); setDeleteConfirm(null); }}
                            className="px-2 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-all"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-2 rounded-lg bg-[#0D1B2A] text-[#4A6B8A] text-xs font-medium hover:text-white transition-all"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(report.id)}
                          className="w-8 h-8 rounded-lg bg-[#0D1B2A] hover:bg-red-500/10 text-[#4A6B8A] hover:text-red-400 flex items-center justify-center transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        onClick={onNewReport}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-[#00C9A7] to-[#1E90FF] rounded-2xl shadow-2xl shadow-[#00C9A7]/30 flex items-center justify-center text-[#0D1B2A] hover:scale-110 active:scale-95 transition-transform z-50"
      >
        <Plus className="w-7 h-7" />
      </motion.button>
    </div>
  );
}

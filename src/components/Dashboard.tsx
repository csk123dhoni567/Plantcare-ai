import React from "react";
import { AlertTriangle, CheckCircle2, TrendingUp, Sparkles, Sprout, ArrowRight, Activity, Calendar, AlertCircle, FileText, ShieldAlert } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrackedCrop, DiagnosisReport } from "../types";

interface DashboardProps {
  crops: TrackedCrop[];
  diagnoses: DiagnosisReport[];
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({ crops, diagnoses, onNavigateToTab }: DashboardProps) {
  // Compute overall health index based on crops
  const overallHealthIndex = crops.length > 0
    ? Math.round(crops.reduce((acc, c) => {
        const lastScore = c.healthHistory?.[c.healthHistory.length - 1]?.score || 100;
        return acc + lastScore;
      }, 0) / crops.length)
    : 100;

  // Compile combined health history for chart
  const getChartData = () => {
    if (crops.length === 0) {
      return [
        { name: "Mon", Health: 95 },
        { name: "Tue", Health: 93 },
        { name: "Wed", Health: 96 },
        { name: "Thu", Health: 94 },
        { name: "Fri", Health: 97 },
        { name: "Sat", Health: 98 },
        { name: "Sun", Health: 98 }
      ];
    }

    // Return the health points of the first crop or a pooled average
    const firstCrop = crops[0];
    return firstCrop.healthHistory.map((h) => ({
      name: h.date,
      Health: h.score
    }));
  };

  const getHealthBadgeStyle = (score: number) => {
    if (score >= 85) return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="dashboard-tab">
      {/* Metrics Row (4 spans each or standard modular grid) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Metric 1: Health Index */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between h-[160px] relative overflow-hidden">
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Overall Farm Health Index</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-stone-850">{overallHealthIndex}%</span>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5">
                Optimal
              </span>
            </div>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallHealthIndex}%` }}
            />
          </div>
          <div className="absolute right-4 top-4 text-emerald-50 bg-emerald-50 px-2 py-2 rounded-xl text-emerald-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Logged Crops Count */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between h-[160px]">
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Active Tracked Species</span>
            <div className="text-4xl font-extrabold text-stone-850 mt-2">{crops.length}</div>
            <p className="text-xs text-stone-400 mt-1">Crops registered in irrigation schedules.</p>
          </div>
          <button
            id="nav-to-crops-btn"
            onClick={() => onNavigateToTab("planner")}
            className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:text-emerald-800 transition-colors self-start mt-2"
          >
            Manage Crop List
          </button>
        </div>

        {/* Metric 3: Scanned Diagnosis Count */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between h-[160px]">
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Leaves Diagnosed</span>
            <div className="text-4xl font-extrabold text-stone-850 mt-2">{diagnoses.length}</div>
            <p className="text-xs text-stone-400 mt-1">Total high-fidelity AI vision scans processed.</p>
          </div>
          <button
            id="nav-to-diagnostics-btn"
            onClick={() => onNavigateToTab("diagnostics")}
            className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:text-emerald-800 transition-colors self-start mt-2"
          >
            Open Diagnosis Lab
          </button>
        </div>
      </div>

      {/* Main Chart Section (8 spans) */}
      <div className="lg:col-span-8 flex flex-col">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm h-full flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-stone-800">Biometric Crop Growth & Health Timeline</h2>
            <p className="text-xs text-stone-400 mt-0.5">Tracks agronomical state fluctuation trends over successive logging periods.</p>
          </div>

          <div className="w-full h-[300px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="name" stroke="#a3a3a3" fontSize={10} tickLine={false} />
                <YAxis stroke="#a3a3a3" fontSize={10} tickLine={false} domain={[50, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1c1917",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Health"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Crop Conditions Table & Alerts */}
      <div className="lg:col-span-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-4 h-[350px]">
          <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            Tracked Crops Overview
          </h3>

          <div className="overflow-y-auto flex-1 flex flex-col gap-2.5 pr-1">
            {crops.length === 0 ? (
              <div className="text-center p-8 text-stone-400 text-xs my-auto flex flex-col items-center gap-2">
                <span>No crops registered.</span>
                <button
                  id="nav-to-crops-preset-btn"
                  onClick={() => onNavigateToTab("planner")}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold transition-all"
                >
                  Register First Crop
                </button>
              </div>
            ) : (
              crops.map((crop) => (
                <div key={crop.id} className="flex justify-between items-center p-3 bg-stone-50 border border-stone-150 rounded-xl" id={`dashboard-crop-item-${crop.id}`}>
                  <div>
                    <h4 className="text-xs font-bold text-stone-700">{crop.name}</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5">{crop.variety}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold border rounded-full ${getHealthBadgeStyle(crop.healthHistory?.[crop.healthHistory.length-1]?.score || 95)}`}>
                      Health: {crop.healthHistory?.[crop.healthHistory.length-1]?.score || 95}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Leaf Diagnoses Feed */}
      <div className="lg:col-span-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-4 h-[350px]">
          <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Diagnosis Scan Logs
          </h3>

          <div className="overflow-y-auto flex-1 flex flex-col gap-2.5 pr-1">
            {diagnoses.length === 0 ? (
              <div className="text-center p-8 text-stone-400 text-xs my-auto">
                No foliage diagnosis logged yet. Scan a leaf in the Diagnostics Lab to populate results here.
              </div>
            ) : (
              diagnoses.map((diag, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-150 rounded-xl" id={`dashboard-diagnosis-item-${index}`}>
                  {diag.imageUrl && (
                    <img
                      src={diag.imageUrl}
                      alt={diag.plantName}
                      className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-1.5">
                      <h4 className="text-xs font-bold text-stone-700 truncate">{diag.plantName}</h4>
                      <span className="text-[9px] text-stone-400 shrink-0 font-mono">{diag.timestamp}</span>
                    </div>
                    <p className="text-[10px] text-emerald-700 font-semibold truncate mt-0.5">
                      {diag.diseaseName === "None" ? "Healthy Plant" : diag.diseaseName}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full shrink-0 ${
                    diag.severity?.toLowerCase() === "high"
                      ? "bg-rose-50 text-rose-700 border-rose-100"
                      : diag.severity?.toLowerCase() === "moderate"
                      ? "bg-amber-50 text-amber-700 border-amber-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-100"
                  }`}>
                    {diag.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

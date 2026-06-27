import React, { useState } from "react";
import { Sprout, Beaker, Bot, Calendar, LayoutDashboard, Settings, Info, Menu, X, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import Dashboard from "./components/Dashboard";
import DiagnosticLab from "./components/DiagnosticLab";
import PlantDoctor from "./components/PlantDoctor";
import CropPlanner from "./components/CropPlanner";
import { TrackedCrop, CareTask, DiagnosisReport } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Prepopulate with elegant, realistic agronomical seeds
  const [crops, setCrops] = useState<TrackedCrop[]>([
    {
      id: "crop_tomato_preset",
      name: "Roma Tomatoes",
      variety: "Solanum lycopersicum",
      addedAt: "2026-06-18",
      status: "Healthy",
      waterIntervalDays: 2,
      fertilizerIntervalDays: 14,
      lastWatered: "2026-06-22",
      lastFertilized: "2026-06-10",
      notes: "Growing in the east garden bed. Monitor for late blight following humid rain forecasts.",
      healthHistory: [
        { date: "06/18", score: 92 },
        { date: "06/20", score: 94 },
        { date: "06/22", score: 95 }
      ]
    },
    {
      id: "crop_spinach_preset",
      name: "Organic Spinach",
      variety: "Spinacia oleracea",
      addedAt: "2026-06-20",
      status: "Healthy",
      waterIntervalDays: 3,
      fertilizerIntervalDays: 21,
      lastWatered: "2026-06-21",
      lastFertilized: "2026-06-20",
      notes: "Sown under shade mesh. Monitor slugs and water regularly during high sun hours.",
      healthHistory: [
        { date: "06/20", score: 90 },
        { date: "06/21", score: 93 },
        { date: "06/23", score: 96 }
      ]
    }
  ]);

  const [diagnoses, setDiagnoses] = useState<DiagnosisReport[]>([
    {
      plantName: "Tomato (Roma)",
      healthState: "Healthy foliage",
      diseaseName: "None",
      severity: "None",
      confidence: 0.98,
      description: "Foliage displays optimal green color with no visible fungal spotting, chlorosis, or necrotic margins.",
      symptoms: ["Healthy dark green pigmentation", "Intact leaf margins", "Strong petiole alignment"],
      organicRemedies: ["Maintain standard companion planting with marigolds to deter nematodes"],
      chemicalRemedies: ["None needed"],
      prevention: ["Water at soil level to prevent humid spore aggregation on lower leaves"],
      causes: ["Optimal sunlight exposure", "Balanced drip irrigation", "Clean air circulation around garden beds"],
      timestamp: "10:15 AM",
      imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=200&auto=format&fit=crop&q=60"
    }
  ]);

  // Initial scheduler care tasks
  const [tasks, setTasks] = useState<CareTask[]>([
    {
      id: "task_tomato_water_1",
      cropId: "crop_tomato_preset",
      cropName: "Roma Tomatoes",
      taskType: "water",
      dueDate: "2026-06-24", // Today
      completed: false
    },
    {
      id: "task_tomato_fert_1",
      cropId: "crop_tomato_preset",
      cropName: "Roma Tomatoes",
      taskType: "fertilize",
      dueDate: "2026-06-26",
      completed: false
    },
    {
      id: "task_spinach_water_1",
      cropId: "crop_spinach_preset",
      cropName: "Organic Spinach",
      taskType: "water",
      dueDate: "2026-06-24", // Today
      completed: false
    }
  ]);

  // Handler: Add crop
  const handleAddCrop = (newCrop: TrackedCrop) => {
    setCrops((prev) => [newCrop, ...prev]);

    // Automatically schedule initial care tasks
    const firstWaterDate = new Date(Date.now() + newCrop.waterIntervalDays * 24 * 60 * 60 * 1000).toLocaleDateString();
    const firstFertDate = new Date(Date.now() + newCrop.fertilizerIntervalDays * 24 * 60 * 60 * 1000).toLocaleDateString();

    const freshTasks: CareTask[] = [
      {
        id: `task_w_${newCrop.id}_${Date.now()}`,
        cropId: newCrop.id,
        cropName: newCrop.name,
        taskType: "water",
        dueDate: firstWaterDate,
        completed: false
      },
      {
        id: `task_f_${newCrop.id}_${Date.now()}`,
        cropId: newCrop.id,
        cropName: newCrop.name,
        taskType: "fertilize",
        dueDate: firstFertDate,
        completed: false
      }
    ];

    setTasks((prev) => [...freshTasks, ...prev]);
  };

  // Handler: Delete crop
  const handleDeleteCrop = (id: string) => {
    if (window.confirm("Are you sure you want to delete this crop and all scheduled tasks?")) {
      setCrops((prev) => prev.filter((c) => c.id !== id));
      setTasks((prev) => prev.filter((t) => t.cropId !== id));
    }
  };

  // Handler: Log irrigation / fertilization event
  const handleUpdateCropCare = (cropId: string, action: "water" | "fertilize") => {
    const todayStr = new Date().toLocaleDateString();

    setCrops((prevCrops) =>
      prevCrops.map((c) => {
        if (c.id === cropId) {
          const lastScore = c.healthHistory?.[c.healthHistory.length - 1]?.score || 95;
          const newScore = Math.min(100, lastScore + 2);
          const updatedHistory = [...c.healthHistory, { date: new Date().toLocaleDateString([], { month: "2-digit", day: "2-digit" }), score: newScore }];
          return {
            ...c,
            lastWatered: action === "water" ? todayStr : c.lastWatered,
            lastFertilized: action === "fertilize" ? todayStr : c.lastFertilized,
            healthHistory: updatedHistory
          };
        }
        return c;
      })
    );

    // Complete matching pending tasks for this crop
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.cropId === cropId && t.taskType === action && !t.completed) {
          return { ...t, completed: true, completedAt: todayStr };
        }
        return t;
      })
    );

    // Automatically queue the NEXT care task
    const crop = crops.find((c) => c.id === cropId);
    if (crop) {
      const intervalDays = action === "water" ? crop.waterIntervalDays : crop.fertilizerIntervalDays;
      const nextDueDate = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toLocaleDateString();
      const nextTask: CareTask = {
        id: `task_${action}_next_${Date.now()}`,
        cropId,
        cropName: crop.name,
        taskType: action,
        dueDate: nextDueDate,
        completed: false
      };
      setTasks((prev) => [nextTask, ...prev]);
    }
  };

  // Handler: Complete specific Care task
  const handleCompleteTask = (taskId: string) => {
    const todayStr = new Date().toLocaleDateString();
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === taskId) {
          // Log care event in corresponding crop
          handleUpdateCropCare(t.cropId, t.taskType);
          return { ...t, completed: true, completedAt: todayStr };
        }
        return t;
      })
    );
  };

  // Handler: Add scanned leaf diagnosis to overall history feed
  const handleAddDiagnosisToHistory = (newReport: DiagnosisReport) => {
    setDiagnoses((prev) => [newReport, ...prev]);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard crops={crops} diagnoses={diagnoses} onNavigateToTab={setActiveTab} />;
      case "diagnostics":
        return <DiagnosticLab onAddDiagnosisToHistory={handleAddDiagnosisToHistory} />;
      case "doctor":
        return <PlantDoctor />;
      case "planner":
        return (
          <CropPlanner
            crops={crops}
            tasks={tasks.filter((t) => !t.completed)}
            onAddCrop={handleAddCrop}
            onDeleteCrop={handleDeleteCrop}
            onUpdateCropCare={handleUpdateCropCare}
            onCompleteTask={handleCompleteTask}
          />
        );
      default:
        return <Dashboard crops={crops} diagnoses={diagnoses} onNavigateToTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans" id="plantcare-ai-app">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-800 tracking-tight">PlantCare AI</h1>
            <p className="text-[10px] font-semibold text-emerald-700 tracking-wider uppercase">Agronomic Co-Pilot</p>
          </div>
        </div>

        {/* Global Stats bar for header */}
        <div className="hidden md:flex items-center gap-6 text-xs text-stone-500">
          <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-150">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-stone-700">Foliar Diagnostics Active</span>
          </div>
          <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-150">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-stone-700">{tasks.filter(t => !t.completed).length} Reminders Today</span>
          </div>
        </div>

        {/* Mobile Navigation Trigger */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg lg:hidden"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-stone-200 p-4 pt-20 flex flex-col gap-1.5 transform transition-transform duration-200 lg:relative lg:translate-x-0 lg:pt-6 lg:z-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 mb-2 block">Navigation</span>
          <button
            id="nav-tab-dashboard"
            onClick={() => {
              setActiveTab("dashboard");
              setIsSidebarOpen(false);
            }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
              activeTab === "dashboard"
                ? "bg-emerald-50 text-emerald-950 border border-emerald-100"
                : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Farm Dashboard
          </button>

          <button
            id="nav-tab-diagnostics"
            onClick={() => {
              setActiveTab("diagnostics");
              setIsSidebarOpen(false);
            }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
              activeTab === "diagnostics"
                ? "bg-emerald-50 text-emerald-950 border border-emerald-100"
                : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
            }`}
          >
            <Beaker className="w-4 h-4" />
            AI Leaf Diagnostics
          </button>

          <button
            id="nav-tab-doctor"
            onClick={() => {
              setActiveTab("doctor");
              setIsSidebarOpen(false);
            }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
              activeTab === "doctor"
                ? "bg-emerald-50 text-emerald-950 border border-emerald-100"
                : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
            }`}
          >
            <Bot className="w-4 h-4" />
            AI Plant Doctor
          </button>

          <button
            id="nav-tab-planner"
            onClick={() => {
              setActiveTab("planner");
              setIsSidebarOpen(false);
            }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
              activeTab === "planner"
                ? "bg-emerald-50 text-emerald-950 border border-emerald-100"
                : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Crop Care Scheduler
          </button>

          {/* Quick Info Block at footer of sidebar */}
          <div className="mt-auto bg-stone-50 p-4 border border-stone-200 rounded-xl flex flex-col gap-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <Info className="w-3 h-3 text-stone-400 animate-pulse" />
              API Settings Key
            </span>
            <p className="text-[10px] text-stone-500 leading-relaxed">
              Ensure you have set `GEMINI_API_KEY` inside the **Settings &gt; Secrets** panel to allow diagnostic scans.
            </p>
          </div>
        </aside>

        {/* Page Content View */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {renderActiveTab()}
        </main>
      </div>

      {/* Footer bar */}
      <footer className="bg-white border-t border-stone-200 py-4 px-6 text-center text-[11px] text-stone-400 flex items-center justify-between">
        <span>PlantCare AI — Premium Agronomic Intelligence Workspace</span>
        <span className="flex items-center gap-1">
          Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for sustainable agriculture
        </span>
      </footer>
    </div>
  );
}

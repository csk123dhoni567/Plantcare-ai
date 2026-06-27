import React, { useState } from "react";
import { Plus, Calendar, Droplets, Beaker, CheckCircle2, FileText, Trash2, Sprout, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";
import { TrackedCrop, CareTask } from "../types";

interface CropPlannerProps {
  crops: TrackedCrop[];
  tasks: CareTask[];
  onAddCrop: (crop: TrackedCrop) => void;
  onDeleteCrop: (id: string) => void;
  onUpdateCropCare: (id: string, action: "water" | "fertilize") => void;
  onCompleteTask: (taskId: string) => void;
}

const POPULAR_PLANT_PRESETS = [
  { name: "Roma Tomato", variety: "Solanum lycopersicum", waterDays: 2, fertDays: 14, notes: "Needs bright sunlight and stable vertical stakes. Guard against late blight." },
  { name: "Organic Spinach", variety: "Spinacia oleracea", waterDays: 3, fertDays: 21, notes: "Prefers cooler temperatures. Harvest outside leaves gradually." },
  { name: "Sweet Yellow Corn", variety: "Zea mays", waterDays: 4, fertDays: 10, notes: "Requires rich nitrogen and heavy initial watering during pollination." },
  { name: "Spring Wheat", variety: "Triticum aestivum", waterDays: 7, fertDays: 30, notes: "Broad-acre field crop. Monitor for rust spots on leaves." }
];

export default function CropPlanner({
  crops,
  tasks,
  onAddCrop,
  onDeleteCrop,
  onUpdateCropCare,
  onCompleteTask
}: CropPlannerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCropName, setNewCropName] = useState("");
  const [newCropVariety, setNewCropVariety] = useState("");
  const [newWaterInterval, setNewWaterInterval] = useState(3);
  const [newFertInterval, setNewFertInterval] = useState(14);
  const [newNotes, setNewNotes] = useState("");

  const handleApplyPreset = (preset: typeof POPULAR_PLANT_PRESETS[0]) => {
    setNewCropName(preset.name);
    setNewCropVariety(preset.variety);
    setNewWaterInterval(preset.waterDays);
    setNewFertInterval(preset.fertDays);
    setNewNotes(preset.notes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName.trim()) return;

    const cropId = "crop_" + Date.now();
    const freshCrop: TrackedCrop = {
      id: cropId,
      name: newCropName,
      variety: newCropVariety || "Common Variety",
      addedAt: new Date().toLocaleDateString(),
      status: "Healthy",
      waterIntervalDays: newWaterInterval,
      fertilizerIntervalDays: newFertInterval,
      notes: newNotes,
      healthHistory: [
        { date: new Date().toLocaleDateString(), score: 95 }
      ]
    };

    onAddCrop(freshCrop);

    // Reset Form
    setNewCropName("");
    setNewCropVariety("");
    setNewWaterInterval(3);
    setNewFertInterval(14);
    setNewNotes("");
    setShowAddForm(false);
  };

  const isOverdue = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0,0,0,0);
    return dueDate < today;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="crop-planner">
      {/* List of Tracked Crops */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-semibold text-stone-800">Tracked Crops & Gardens</h2>
            </div>
            <button
              id="toggle-add-crop-form-btn"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? "Close Form" : "Add New Crop"}
            </button>
          </div>

          {/* Add Crop Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="p-5 bg-stone-50 border border-stone-200 rounded-xl flex flex-col gap-4" id="add-crop-form">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Quick Fill Presets</span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_PLANT_PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      id={`apply-preset-${i}`}
                      onClick={() => handleApplyPreset(p)}
                      className="px-2 py-1 bg-white hover:bg-emerald-50 text-[10px] font-bold text-stone-600 border border-stone-200 rounded-lg hover:border-emerald-200 transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-600">Crop / Plant Name</label>
                  <input
                    type="text"
                    id="new-crop-name-input"
                    value={newCropName}
                    onChange={(e) => setNewCropName(e.target.value)}
                    placeholder="e.g. Garden Beefsteak Tomato"
                    className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 text-stone-700"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-600">Variety / Scientific Name</label>
                  <input
                    type="text"
                    id="new-crop-variety-input"
                    value={newCropVariety}
                    onChange={(e) => setNewCropVariety(e.target.value)}
                    placeholder="e.g. Solanum lycopersicum"
                    className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 text-stone-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-600">Watering Frequency (Every X Days)</label>
                  <input
                    type="number"
                    id="new-water-interval-input"
                    value={newWaterInterval}
                    onChange={(e) => setNewWaterInterval(parseInt(e.target.value) || 1)}
                    min="1"
                    className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 text-stone-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-600">Fertilizer Frequency (Every X Days)</label>
                  <input
                    type="number"
                    id="new-fertilizer-interval-input"
                    value={newFertInterval}
                    onChange={(e) => setNewFertInterval(parseInt(e.target.value) || 1)}
                    min="1"
                    className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 text-stone-700"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-600">Cultivation Guidelines & Notes</label>
                <textarea
                  id="new-crop-notes-textarea"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Water requirements, optimal soil conditions, pest notices..."
                  rows={2}
                  className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 text-stone-700"
                />
              </div>

              <button
                type="submit"
                id="submit-add-crop-btn"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Register Crop to Schedule
              </button>
            </form>
          )}

          {/* Crops Grid */}
          {crops.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center gap-3">
              <Calendar className="w-8 h-8 text-stone-300" />
              <div>
                <p className="text-sm font-semibold text-stone-600">No Crops Tracked</p>
                <p className="text-xs text-stone-400 mt-1">Register your active crops to monitor dynamic watering calendars and fertilization reminders.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crops.map((crop) => (
                <div key={crop.id} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-200 transition-all group" id={`tracked-crop-card-${crop.id}`}>
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-stone-850 group-hover:text-emerald-800 transition-colors text-sm">{crop.name}</h3>
                        <p className="text-[10px] text-stone-400 italic mt-0.5">{crop.variety}</p>
                      </div>
                      <button
                        id={`delete-crop-btn-${crop.id}`}
                        onClick={() => onDeleteCrop(crop.id)}
                        className="p-1 text-stone-300 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Delete Crop Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {crop.notes && (
                      <p className="text-[11px] text-stone-500 mt-3 line-clamp-2 bg-white border border-stone-150 p-2 rounded-lg leading-relaxed">{crop.notes}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-stone-500">
                      <div className="bg-white px-2.5 py-1.5 rounded-lg border border-stone-150 flex flex-col">
                        <span className="font-semibold text-stone-400">WATERING</span>
                        <span className="text-stone-700 font-bold mt-0.5">Every {crop.waterIntervalDays} days</span>
                        <span className="text-[9px] mt-0.5">Last: {crop.lastWatered || "Not logged"}</span>
                      </div>
                      <div className="bg-white px-2.5 py-1.5 rounded-lg border border-stone-150 flex flex-col">
                        <span className="font-semibold text-stone-400">FERTILIZATION</span>
                        <span className="text-stone-700 font-bold mt-0.5">Every {crop.fertilizerIntervalDays} days</span>
                        <span className="text-[9px] mt-0.5">Last: {crop.lastFertilized || "Not logged"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-stone-200">
                    <button
                      id={`log-water-btn-${crop.id}`}
                      onClick={() => onUpdateCropCare(crop.id, "water")}
                      className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 border border-emerald-100 transition-colors"
                    >
                      <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                      Log Water
                    </button>
                    <button
                      id={`log-fertilize-btn-${crop.id}`}
                      onClick={() => onUpdateCropCare(crop.id, "fertilize")}
                      className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 border border-amber-100 transition-colors"
                    >
                      <Beaker className="w-3.5 h-3.5 text-amber-600" />
                      Log Fertilize
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checklist Side Rail */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-stone-800">Care Scheduler</h3>
          </div>
          <p className="text-xs text-stone-500">Auto-scheduled care actions for your added plants:</p>

          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="p-4 text-center bg-stone-50 rounded-xl border border-stone-150 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <span className="text-xs text-stone-500 font-semibold">All Crops Healthy & Checked</span>
              </div>
            ) : (
              tasks.map((task) => {
                const overdue = isOverdue(task.dueDate) && !task.completed;
                return (
                  <div
                    key={task.id}
                    id={`scheduler-task-item-${task.id}`}
                    className={`p-3 rounded-xl border transition-all flex justify-between items-center gap-3 ${
                      task.completed
                        ? "bg-stone-50/50 border-stone-100 opacity-60"
                        : overdue
                        ? "bg-rose-50 border-rose-200"
                        : "bg-white border-stone-200"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {task.taskType === "water" ? (
                        <Droplets className={`w-4 h-4 mt-0.5 shrink-0 ${overdue ? "text-rose-500 animate-pulse" : "text-emerald-500"}`} />
                      ) : (
                        <Beaker className={`w-4 h-4 mt-0.5 shrink-0 ${overdue ? "text-rose-500 animate-pulse" : "text-amber-500"}`} />
                      )}
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${task.completed ? "line-through text-stone-400" : "text-stone-700"}`}>
                          {task.taskType === "water" ? "Water" : "Fertilize"} {task.cropName}
                        </p>
                        <p className="text-[9px] text-stone-400 mt-0.5">Due: {task.dueDate}</p>
                        {overdue && (
                          <span className="text-[8px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded mt-1 inline-block">OVERDUE</span>
                        )}
                      </div>
                    </div>

                    {!task.completed && (
                      <button
                        id={`complete-task-btn-${task.id}`}
                        onClick={() => onCompleteTask(task.id)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 rounded-lg border border-emerald-200 transition-all flex items-center justify-center shrink-0"
                        title="Mark Complete"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dynamic Micro Advice Panel */}
        <div className="bg-stone-900 text-stone-100 p-5 rounded-2xl border border-stone-850 flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] opacity-10">
            <Sparkles className="w-24 h-24 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            AI Smart Recommendation
          </span>
          <p className="text-xs text-stone-300 leading-relaxed">
            "Late blight develops rapidly in humid climates over 60°F. If you track solanaceous crops like tomatoes, water at the soil base to avoid wet foliage."
          </p>
          <span className="text-[9px] text-stone-400 mt-2 self-end italic">— Dr. Sage</span>
        </div>
      </div>
    </div>
  );
}

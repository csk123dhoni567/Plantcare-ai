export interface DiagnosisReport {
  plantName: string;
  healthState: string;
  diseaseName: string;
  severity: "None" | "Low" | "Moderate" | "High" | string;
  confidence: number;
  description: string;
  symptoms: string[];
  organicRemedies: string[];
  chemicalRemedies: string[];
  prevention: string[];
  causes?: string[];
  imageUrl?: string;
  timestamp?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface CropHealthData {
  date: string;
  score: number; // 0 to 100
}

export interface TrackedCrop {
  id: string;
  name: string;
  variety: string;
  addedAt: string;
  status: "Healthy" | "Warning" | "Critical";
  waterIntervalDays: number;
  fertilizerIntervalDays: number;
  lastWatered?: string;
  lastFertilized?: string;
  notes?: string;
  healthHistory: CropHealthData[];
}

export interface CareTask {
  id: string;
  cropId: string;
  cropName: string;
  taskType: "water" | "fertilize" | "harvest" | "prune" | "inspect";
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

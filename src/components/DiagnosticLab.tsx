import React, { useState, useRef, useEffect } from "react";
import { Upload, Camera, Leaf, AlertTriangle, CheckCircle2, Shield, Beaker, HelpCircle, ArrowRight, RefreshCw, ArrowLeft, Share2, Heart } from "lucide-react";
import { DiagnosisReport } from "../types";

interface DiagnosticLabProps {
  onAddDiagnosisToHistory: (report: DiagnosisReport) => void;
}

// Low-size base64 placeholder images for realistic plant samples
const SAMPLE_PLANTS = [
  {
    id: "coconut_spot",
    name: "Coconut Palm (Fungal Leaf Spot suspect)",
    imgSrc: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&auto=format&fit=crop&q=60",
    description: "Brown necrotic lesions with yellow margins on pinnate palm foliage.",
    mockFile: "coconut_leaf_spot.jpg"
  },
  {
    id: "tomato_blight",
    name: "Tomato Leaf (Late Blight suspect)",
    imgSrc: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=400&auto=format&fit=crop&q=60",
    description: "Dark brown water-soaked lesions on leaf margins with pale green halos.",
    mockFile: "tomato_leaf_blight.jpg"
  },
  {
    id: "apple_scab",
    name: "Apple Leaf (Scab suspect)",
    imgSrc: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop&q=60",
    description: "Olive-green to black velvety spots, puckered or distorted leaf surface.",
    mockFile: "apple_scab.jpg"
  },
  {
    id: "rice_blast",
    name: "Rice Leaf (Blast suspect)",
    imgSrc: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=400&auto=format&fit=crop&q=60",
    description: "Spindle-shaped (elliptical) lesions with greyish center and brown borders.",
    mockFile: "rice_blast.jpg"
  }
];

export default function DiagnosticLab({ onAddDiagnosisToHistory }: DiagnosticLabProps) {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<"treatment" | "symptoms" | "causes" | "prevention">("treatment");
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      setIsCameraActive(true);
      setImage(null);
      setReport(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Video play failed:", e));
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setIsCameraActive(false);
      setError("Unable to access camera. Please make sure camera permissions are allowed or upload a file directly.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImage(dataUrl);
        setMimeType("image/jpeg");
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, JPEG).");
      return;
    }
    setError(null);
    setReport(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Convert image from standard dataURL to pure base64 for API delivery
  const getPureBase64 = (dataUrl: string): string => {
    if (!dataUrl.includes(",")) return "";
    return dataUrl.split(",")[1];
  };

  const analyzeLeaf = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const isBase64 = image.startsWith("data:");
      const requestBody = isBase64
        ? { image: getPureBase64(image), mimeType: mimeType || "image/jpeg" }
        : { imageUrl: image };

      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze leaf image. Ensure your Gemini API Key is configured.");
      }

      const data: DiagnosisReport = await response.json();
      const updatedReport = {
        ...data,
        imageUrl: image,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setReport(updatedReport);
      onAddDiagnosisToHistory(updatedReport);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during crop diagnosis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectPresetSample = async (sampleImgUrl: string) => {
    setError(null);
    setReport(null);
    setIsAnalyzing(true);
    setImage(sampleImgUrl);
    setMimeType("image/jpeg");

    try {
      const apiResponse = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: sampleImgUrl,
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || "Failed to analyze leaf image. Ensure your Gemini API Key is configured.");
      }

      const data: DiagnosisReport = await apiResponse.json();
      const updatedReport = {
        ...data,
        imageUrl: sampleImgUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setReport(updatedReport);
      onAddDiagnosisToHistory(updatedReport);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not analyze selected crop sample. Ensure your Gemini API Key is configured.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "high":
      case "critical":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "moderate":
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "low":
        return "bg-sky-50 text-sky-700 border-sky-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="diagnostic-lab">
      {/* Interactive Upload / Camera Section */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
            <Beaker className="w-5 h-5 text-emerald-600" />
            AI Diagnostics Lab
          </h2>
          <p className="text-sm text-stone-500">
            Scan your crop leaf for early detection of fungal diseases, pests, nutrient deficits, or mechanical damages.
          </p>

          {/* Camera Frame */}
          {isCameraActive && (
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-stone-800">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                <button
                  id="capture-photo-btn"
                  onClick={capturePhoto}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </button>
                <button
                  id="stop-camera-btn"
                  onClick={stopCamera}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-950 text-white rounded-full text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Upload Dropzone */}
          {!isCameraActive && (
            <div
              id="dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                isDragOver
                  ? "border-emerald-500 bg-emerald-50/50"
                  : "border-stone-300 hover:border-emerald-500 hover:bg-stone-50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              {image ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-stone-200">
                  <img src={image} alt="Crop sample" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full cursor-pointer transition-colors" onClick={(e) => { e.stopPropagation(); setImage(null); setReport(null); }}>
                    <RefreshCw className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-stone-700">Drag & drop plant leaf image</p>
                    <p className="text-xs text-stone-400 mt-1">or click to browse from files</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action Row */}
          {!isCameraActive && (
            <div className="flex gap-3 mt-2">
              <button
                id="camera-init-btn"
                onClick={startCamera}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-stone-200 transition-colors"
              >
                <Camera className="w-4 h-4 text-stone-500" />
                Use Camera
              </button>
              {image && (
                <button
                  id="analyze-image-btn"
                  onClick={analyzeLeaf}
                  disabled={isAnalyzing}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Leaf className="w-4 h-4" />
                      Analyze Leaf
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-xs flex gap-2 items-start mt-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Demo Preset Samples Box */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-3">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Demo / Testing Samples</span>
          <p className="text-xs text-stone-500">Don't have a leaf to photograph? Click one of these common diseased leaf cases to test the AI system instantly:</p>
          <div className="grid grid-cols-1 gap-2.5 mt-1">
            {SAMPLE_PLANTS.map((sample) => (
              <button
                key={sample.id}
                id={`sample-preset-${sample.id}`}
                onClick={() => selectPresetSample(sample.imgSrc)}
                disabled={isAnalyzing}
                className="flex items-center gap-3 p-2 bg-stone-50 hover:bg-stone-100 disabled:opacity-50 text-left border border-stone-200 rounded-xl transition-all group"
              >
                <img
                  src={sample.imgSrc}
                  alt={sample.name}
                  className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-700 truncate group-hover:text-emerald-700 transition-colors">{sample.name}</p>
                  <p className="text-[10px] text-stone-400 truncate mt-0.5">{sample.description}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Diagnosis Report Results Screen */}
      <div className="lg:col-span-7">
        {isAnalyzing ? (
          <div className="bg-white h-full min-h-[400px] p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
              <Leaf className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-800">Processing Plant Leaf Diagnostics</h3>
              <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto">
                Scanning leaf contours, assessing fungal spores, spots, mechanical markings, and chlorophyll density ratios...
              </p>
            </div>
          </div>
        ) : report ? (
          <div className="bg-gradient-to-b from-[#1b8a5a] to-[#14532d] p-5 sm:p-7 rounded-3xl text-white border border-emerald-800 shadow-xl flex flex-col gap-5" id="diagnostic-report-card">
            {/* Header with Back & Share icons */}
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <button
                onClick={() => setReport(null)}
                className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                id="report-back-btn"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-[13px] font-black tracking-widest text-emerald-100 uppercase">DIAGNOSIS REPORT</span>
              <button className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Leaf Image Card with Red Dashed Symptom Region */}
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-inner border border-white/10">
              <img
                src={report.imageUrl || image || "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=400&auto=format&fit=crop&q=60"}
                alt="Analyzed leaf"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Highlight red dashed boundary box for symptoms exactly like the screenshot */}
              {report.diseaseName.toLowerCase() !== "none" && report.diseaseName.toLowerCase() !== "healthy" && (
                <div className="absolute top-[18%] left-[20%] w-[50%] h-[50%] border-2 border-dashed border-red-500 rounded-2xl flex flex-col justify-start items-start p-2 pointer-events-none animate-pulse">
                  <span className="bg-red-600 text-white font-extrabold text-[8px] sm:text-[9px] uppercase px-2 py-0.5 rounded-md tracking-wider flex items-center gap-1 shadow-md">
                    🚨 LEAF SPOT SYMPTOMS
                  </span>
                </div>
              )}
            </div>

            {/* Disease Identity Details */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                {/* DISEASES status pill */}
                <span className={`px-3 py-1 font-extrabold rounded-full text-[10px] tracking-wider uppercase border ${
                  report.diseaseName.toLowerCase() === "none" || report.diseaseName.toLowerCase() === "healthy"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                }`}>
                  {report.diseaseName.toLowerCase() === "none" || report.diseaseName.toLowerCase() === "healthy" ? "HEALTHY" : "DISEASED"}
                </span>

                {/* Confidence pill */}
                <div className="bg-white/10 px-4 py-1.5 rounded-2xl flex flex-col items-center justify-center border border-white/5">
                  <span className="text-[8px] text-emerald-200/75 font-bold uppercase tracking-widest">CONFIDENCE</span>
                  <span className="text-sm font-black text-white">{(report.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-white tracking-tight leading-none">{report.diseaseName}</h3>
                <p className="text-xs text-emerald-200/80 font-medium mt-1.5">Host Plant: {report.plantName}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-200/90">Pathogen Severity</span>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-md tracking-widest uppercase ${
                  report.severity.toLowerCase() === "high" || report.severity.toLowerCase() === "critical"
                    ? "bg-rose-600 text-white border border-rose-500"
                    : report.severity.toLowerCase() === "moderate" || report.severity.toLowerCase() === "warning"
                    ? "bg-amber-500 text-white border border-amber-400"
                    : report.severity.toLowerCase() === "low"
                    ? "bg-sky-500 text-white border border-sky-400"
                    : "bg-emerald-600 text-white border border-emerald-500"
                }`}>
                  {report.severity}
                </span>
              </div>
            </div>

            {/* Tab controls exactly like the pill capsules in the screenshot */}
            <div className="bg-emerald-950/40 p-1 rounded-full border border-white/10 flex justify-between gap-1">
              {(["treatment", "symptoms", "causes", "prevention"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveReportTab(tab)}
                  className={`flex-1 py-1.5 px-2.5 rounded-full text-[11px] font-bold tracking-wider capitalize transition-all ${
                    activeReportTab === tab
                      ? "bg-white text-emerald-950 shadow-sm font-extrabold"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Active Tab Content Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/15 text-white flex flex-col gap-4">
              {activeReportTab === "treatment" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-200 border-b border-white/10 pb-2">
                    <Heart className="w-4 h-4 text-emerald-300 shrink-0" />
                    🩺 CURE & DIRECT ADVISORY ACTIONS
                  </div>
                  <div className="flex flex-col gap-3">
                    {report.organicRemedies.map((rem, index) => (
                      <div key={`org-${index}`} className="flex gap-3 items-start">
                        <span className="w-6 h-6 rounded-full bg-white/20 border border-white/30 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-xs text-white/90 leading-relaxed">{rem}</p>
                      </div>
                    ))}
                    {report.chemicalRemedies && report.chemicalRemedies.length > 0 && report.chemicalRemedies[0].toLowerCase() !== "none needed" && (
                      <div className="mt-2 border-t border-white/10 pt-3 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                          <Beaker className="w-3.5 h-3.5 text-amber-300" />
                          Chemical Remedy Alternative
                        </span>
                        {report.chemicalRemedies.map((rem, index) => (
                          <div key={`chem-${index}`} className="flex gap-3 items-start bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                            <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-black flex items-center justify-center shrink-0">
                              C{index + 1}
                            </span>
                            <p className="text-xs text-amber-100/90 leading-relaxed">{rem}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeReportTab === "symptoms" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-200 border-b border-white/10 pb-2">
                    <Leaf className="w-4 h-4 text-emerald-300 shrink-0" />
                    🔍 DETECTED VISUAL SYMPTOMS
                  </div>
                  <p className="text-xs text-white/95 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                    {report.description}
                  </p>
                  <div className="flex flex-col gap-2 mt-1">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Identified Symptoms:</span>
                    {report.symptoms.map((sym, index) => (
                      <div key={`sym-${index}`} className="flex gap-2.5 items-center bg-white/5 p-2 rounded-lg border border-white/5 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <p className="text-xs text-white/95">{sym}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeReportTab === "causes" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-200 border-b border-white/10 pb-2">
                    <AlertTriangle className="w-4 h-4 text-emerald-300 shrink-0" />
                    ⚠️ BIOLOGICAL PATHOGEN CAUSES
                  </div>
                  <div className="flex flex-col gap-3">
                    {(report.causes && report.causes.length > 0 ? report.causes : [
                      "Fungal micro-spores carried by high winds or splashing overhead water.",
                      "Sustained ambient humidity levels exceeding 82% causing spore germination.",
                      "Dense plant spacing restricting ventilation and keeping foliage damp after rain.",
                      "Sub-optimal trace potassium levels reducing outer cuticle cell resistance."
                    ]).map((cause, index) => (
                      <div key={`cause-${index}`} className="flex gap-3 items-start bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="bg-emerald-800/60 text-emerald-200 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          !
                        </span>
                        <p className="text-xs text-white/90 leading-relaxed">{cause}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeReportTab === "prevention" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-200 border-b border-white/10 pb-2">
                    <Shield className="w-4 h-4 text-emerald-300 shrink-0" />
                    🛡️ PREVENTATIVE AGRI-PRACTICES
                  </div>
                  <div className="flex flex-col gap-3">
                    {report.prevention.map((prev, index) => (
                      <div key={`prev-${index}`} className="flex gap-3 items-start">
                        <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                        <p className="text-xs text-white/90 leading-relaxed">{prev}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white h-full min-h-[400px] p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center gap-4">
            <div className="p-4 bg-stone-50 text-stone-400 rounded-full border border-stone-100">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-700">No Diagnosis Active</h3>
              <p className="text-sm text-stone-400 mt-1 max-w-xs mx-auto">
                Upload a plant leaf image, capture a live picture using your device camera, or choose a sample template on the left to view deep agronomical analysis.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

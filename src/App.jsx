import React, { useState, useRef, useEffect } from "react";
import {
  Leaf,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Info,
  ChevronRight,
  Bug,
  ThermometerSun,
  Droplets
} from "lucide-react";

// --- API CONFIG ---
const GEMINI_MODEL = "gemini-2.5-flash";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const hasApiKey = Boolean(API_KEY && API_KEY.length > 0);

const App = () => {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Camera
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      setError(err?.message || "Camera access denied");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const ctx = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    setImage(canvasRef.current.toDataURL("image/png"));
    stopCamera();
  };

  // AI Analysis
  const analyzeImage = async () => {
    if (!image) return;
    if (!hasApiKey) {
      setError("VITE_GEMINI_API_KEY not set. Add it to your .env file.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64 = image.split(",")[1];

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Analyze this flower image for disease detection." },
                { inlineData: { mimeType: "image/png", data: base64 } }
              ]
            }]
          })
        }
      );

      if (!res.ok) {
        const errBody = await res.text();
        let errMsg = "AI request failed";
        try {
          const parsedErr = JSON.parse(errBody);
          errMsg = parsedErr.error?.message || errMsg;
        } catch {
          errMsg = errBody || errMsg;
        }
        throw new Error(errMsg);
      }

      const json = await res.json();
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const text = parts
        .map((part) => (typeof part.text === "string" ? part.text : ""))
        .filter(Boolean)
        .join("\n");

      let parsed = null;
      const trimmed = text.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          parsed = JSON.parse(trimmed);
        } catch {
          parsed = null;
        }
      }

      if (parsed && typeof parsed === "object") {
        setResult({ raw: text, parsed });
      } else {
        setResult(text || JSON.stringify(json.candidates?.[0]?.content || json, null, 2));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <header className="flex items-center gap-3 mb-6">
        <Leaf className="text-emerald-600" />
        <h1 className="text-xl font-bold">FloraScan AI</h1>
      </header>

          {!image && !cameraActive && (
        <div className="border-dashed border-2 p-6 rounded-xl">
          <input type="file" accept="image/*" onChange={handleFileUpload} />
          <button onClick={startCamera}>Open Camera</button>
        </div>
      )}

      {cameraActive && (
        <div>
          <video ref={videoRef} autoPlay />
          <button onClick={capturePhoto}>Capture</button>
          <button onClick={stopCamera}>Cancel</button>
        </div>
      )}

      {image && (
        <>
          <img src={image} alt="preview" className="rounded-xl my-4" />
          {!result && (
            <>
              <button onClick={analyzeImage} disabled={isAnalyzing || !hasApiKey}>
                {isAnalyzing ? "Analyzing..." : "Run Analysis"}
              </button>
              {!hasApiKey && (
                <p className="text-yellow-600 mt-2">Set VITE_GEMINI_API_KEY in your .env to enable AI analysis.</p>
              )}
            </>
          )}
        </>
      )}

      {error && <p className="text-red-600">{error}</p>}
      {result && typeof result === "string" && (
        <pre className="whitespace-pre-wrap break-words">{result}</pre>
      )}
      {result && typeof result === "object" && result.parsed && (
        <div className="rounded-xl border border-emerald-300 bg-white p-4 text-left text-black">
          <h2 className="text-lg font-bold mb-2">Disease Analysis</h2>
          <div className="mb-2"><strong>Plant:</strong> {result.parsed.plant_type || result.parsed.flower_name || "Unknown"}</div>
          <div className="mb-2"><strong>Detected:</strong> {String(result.parsed.disease_detection?.detected ?? result.parsed.detected ?? "unknown")}</div>
          <div className="mb-2"><strong>Disease:</strong> {result.parsed.disease_detection?.disease_name || result.parsed.disease_name || "N/A"}</div>
          <div className="mb-2"><strong>Confidence:</strong> {result.parsed.disease_detection?.confidence_score ?? result.parsed.confidence_score ?? "N/A"}</div>
          {result.parsed.recommendations && (
            <div className="mb-2"><strong>Recommendations:</strong> <ul className="list-disc list-inside">{Array.isArray(result.parsed.recommendations?.treatment) ? result.parsed.recommendations.treatment.map((item, i) => <li key={i}>{item}</li>) : <li>{JSON.stringify(result.parsed.recommendations)}</li>}</ul></div>
          )}
          <details className="mt-2 p-2 border rounded"><summary className="cursor-pointer">Raw JSON result</summary><pre className="mt-2 whitespace-pre-wrap break-words bg-slate-100 p-2 rounded">{JSON.stringify(result.parsed, null, 2)}</pre></details>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default App;

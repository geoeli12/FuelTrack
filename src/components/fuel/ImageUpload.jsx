import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2 } from "lucide-react";

export default function ImageUpload({ label, value, onChange, onImageAnalyzed }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
      
      // Optionally analyze the image with AI
      if (onImageAnalyzed) {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Look at this fuel gauge image and estimate the fuel level as a percentage (0-100). 
                   Just respond with a single number representing your best estimate of the percentage shown on the gauge.
                   If you cannot determine the reading, respond with -1.`,
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              percentage: { type: "number" }
            }
          }
        });
        onImageAnalyzed(result.percentage);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt={label}
            className="w-full h-40 object-cover rounded-xl border border-slate-200"
          />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-colors">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          ) : (
            <>
              <Camera className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm text-slate-500">Tap to upload photo</span>
            </>
          )}
        </label>
      )}
    </div>
  );
}
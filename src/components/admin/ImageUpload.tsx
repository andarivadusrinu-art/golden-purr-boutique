import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hidePreview?: boolean;
}

export function ImageUpload({ value, onChange, label, hidePreview }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "gold_preset";
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "gold_cloud";

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        onChange(data.secure_url);
        toast.success("Image uploaded successfully");
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {label && <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</label>}
      
      <div className="relative group">
        {!hidePreview && value ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <img src={value} alt="Uploaded" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-md hover:bg-white/30 transition-all"
              >
                <Upload className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-lg bg-destructive/20 p-2 text-destructive backdrop-blur-md hover:bg-destructive/30 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 transition-all hover:border-accent/30 hover:bg-white/10 disabled:opacity-50 ${hidePreview ? 'w-full h-full' : 'aspect-video w-full'}`}
          >
            {uploading ? (
              <Loader2 className={`animate-spin text-accent ${hidePreview ? 'h-5 w-5' : 'h-8 w-8'}`} />
            ) : (
              <>
                <Plus className={`text-accent ${hidePreview ? 'h-6 w-6' : 'h-8 w-8 mb-4'}`} />
                {!hidePreview && (
                  <>
                    <p className="text-sm font-medium text-foreground">Click to upload image</p>
                    <p className="mt-1 text-xs text-muted-foreground">PNG, JPG or WebP up to 5MB</p>
                  </>
                )}
              </>
            )}
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
}

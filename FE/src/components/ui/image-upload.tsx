import React, { useRef, useState } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadService } from "@/features/upload/services/upload.service";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string, publicId: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  context?: "expense" | "avatar";
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  context = "expense",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước ảnh không được vượt quá 5MB");
      e.target.value = "";
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Chỉ chấp nhận file ảnh");
      e.target.value = "";
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const result = await uploadService.uploadImage(file, context);
      onChange(result.url, result.publicId);
    } catch (err: any) {
      setError(err.response?.data?.message || "Tải ảnh thất bại. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      e.target.value = "";
    }
  };

  if (value) {
    return (
      <div className="relative group w-full h-40 rounded-md border border-[#E8E7E5] bg-[#F7F6F3] overflow-hidden">
        <img
          src={value}
          alt="Preview"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
            disabled={disabled}
            className="h-8 shadow-sm flex gap-1.5"
          >
            <X className="w-4 h-4" /> Xóa ảnh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={`
          flex flex-col items-center justify-center w-full h-32 
          border-2 border-dashed border-[#E8E7E5] rounded-md bg-[#FAFAFA]
          transition-colors duration-150 group
          ${disabled || isUploading ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-[#F7F6F3] hover:border-[#D4D4D4]"}
        `}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-[#9B9A97]">
            <Loader2 className="w-6 h-6 animate-spin text-[#37352F]" />
            <span className="text-sm font-medium text-[#37352F]">Đang tải lên...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#9B9A97]">
            <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow transition-shadow">
              <ImageIcon className="w-5 h-5 text-[#37352F]" />
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-[#37352F]">Tải ảnh lên</span>
              <p className="text-xs mt-0.5">JPG, PNG, WebP tối đa 5MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 leading-4" role="alert">
          {error}
        </p>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
}

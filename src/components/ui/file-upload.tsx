/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  FileText,
  Image as ImageIcon,
  Paperclip,
  X,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type FileUploadProps = {
  value?: File | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  error?: boolean;
  disabled?: boolean;
};

const ACCEPTED_TYPES: Record<string, { label: string; icon: typeof FileText }> =
  {
    "application/pdf": { label: "PDF", icon: FileText },
    "image/jpeg": { label: "JPG", icon: ImageIcon },
    "image/png": { label: "PNG", icon: ImageIcon },
    "image/webp": { label: "WEBP", icon: ImageIcon },
  };

const MAX_SIZE_MB = 5;

export function FileUpload({
  value,
  onChange,
  accept = "application/pdf,image/jpeg,image/png,image/webp",
  error,
  disabled,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Gera ou revoga a object URL quando o arquivo muda
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const isImage = value.type.startsWith("image/");
    if (!isImage) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [value]);

  function handleFile(file: File) {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Arquivo muito grande. Máximo ${MAX_SIZE_MB}MB.`);
      return;
    }
    if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
      alert("Formato não aceito. Use PDF, JPG ou PNG.");
      return;
    }
    onChange?.(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onChange?.(null);
    setLightboxOpen(false);
  }

  const isPdf = value?.type === "application/pdf";
  const isImage = value?.type.startsWith("image/");
  const FileIcon = value
    ? (ACCEPTED_TYPES[value.type]?.icon ?? FileText)
    : Paperclip;

  return (
    <div className="flex flex-col gap-2">
      {/* Drop zone */}
      <div
        onClick={() => !disabled && !value && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition ${disabled ? "cursor-not-allowed opacity-50" : value ? "cursor-default" : "cursor-pointer"} ${dragOver ? "border-primary bg-primary/5" : ""} ${error ? "border-red-500" : "border-border"} ${!value && !dragOver && !error ? "hover:border-ring hover:bg-muted/30" : ""} ${value ? "bg-muted/20" : "bg-background"} `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled}
          onChange={handleChange}
        />

        <FileIcon
          className={`size-4 shrink-0 ${value ? "text-primary" : "text-muted-foreground"}`}
        />

        {value ? (
          <>
            <span className="text-foreground flex-1 truncate text-sm">
              {value.name}
            </span>
            <span className="text-muted-foreground shrink-0 text-xs">
              {(value.size / 1024).toFixed(0)}KB
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-muted-foreground hover:text-destructive shrink-0 transition"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <span className="text-muted-foreground flex flex-col">
            {dragOver ? (
              "Solte o arquivo aqui"
            ) : (
              <>
                <span className="font-semibold">Clique ou arraste</span>
                <small>(PDF, JPG, PNG · máx. 5MB)</small>
              </>
            )}
          </span>
        )}
      </div>

      {/* Preview de imagem */}
      {isImage && previewUrl && (
        <div className="group border-border relative w-full overflow-hidden rounded-md border">
          <Image
            src={previewUrl}
            alt="Preview"
            width={100}
            height={100}
            className="max-h-48 w-full object-cover"
          />
          {/* Overlay com botão de ampliar */}
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/30"
          >
            <ZoomIn className="size-6 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          </button>
        </div>
      )}

      {/* Preview de PDF */}
      {isPdf && value && (
        <div className="border-border bg-muted/20 flex items-center gap-2 rounded-md border px-3 py-2">
          <FileText className="text-primary size-4 shrink-0" />
          <span className="text-muted-foreground flex-1 truncate text-xs">
            {value.name}
          </span>

          <Link
            href={URL.createObjectURL(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary shrink-0 text-xs hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Abrir PDF
          </Link>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="bg-background border-border text-muted-foreground hover:text-foreground absolute -top-3 -right-3 z-10 flex size-7 items-center justify-center rounded-full border transition"
            >
              <X className="size-4" />
            </button>
            <Image
              src={previewUrl}
              alt="Preview ampliado"
              width={100}
              height={100}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

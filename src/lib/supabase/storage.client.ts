import { createClient } from "@/lib/supabase/client";

export type Bucket = "attachments";

export type UploadResult = {
  url: string | null;
  error: string | null;
};

// Extrai o path relativo de uma URL pública do Supabase Storage
// Ex: https://xxx.supabase.co/storage/v1/object/public/attachments/invoices/file.pdf
// → invoices/file.pdf
export function extractStoragePath(
  publicUrl: string,
  bucket: Bucket,
): string | null {
  try {
    const marker = `/object/public/${bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return publicUrl.slice(idx + marker.length);
  } catch {
    return null;
  }
}

export async function uploadFile(
  file: File,
  bucket: Bucket,
  folder: string,
): Promise<UploadResult> {
  const supabase = createClient();

  const ext = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: false });

  if (error) return { url: null, error: error.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return { url: data.publicUrl, error: null };
}

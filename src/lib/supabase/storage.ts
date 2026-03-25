import { createClient } from "@/lib/supabase/client";

type UploadResult = {
  url: string | null;
  error: string | null;
};

export async function uploadFile(
  file: File,
  folder: "attachments" | "invoices",
): Promise<UploadResult> {
  const supabase = createClient();

  // Nome único para evitar colisão
  const ext = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("attachments")
    .upload(fileName, file, { upsert: false });

  if (error) return { url: null, error: error.message };

  const { data } = supabase.storage.from("attachments").getPublicUrl(fileName);

  return { url: data.publicUrl, error: null };
}

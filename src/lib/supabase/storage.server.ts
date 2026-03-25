import { createClient } from "@/lib/supabase/server";
import { extractStoragePath, type Bucket } from "./storage.client";

export async function deleteFiles(
  publicUrls: string[],
  bucket: Bucket,
): Promise<void> {
  const paths = publicUrls
    .map((url) => extractStoragePath(url, bucket))
    .filter((p): p is string => !!p);

  if (paths.length === 0) return;

  const supabase = await createClient();

  await supabase.storage.from(bucket).remove(paths);
}

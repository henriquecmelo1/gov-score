import { SupabaseClient } from "@supabase/supabase-js";

export type StorageFile = {
  filename: string;
  content: Buffer;
  mimeType: string;
};

export async function getFileFromStorage(
  supabase: SupabaseClient,
  bucketName: string,
  filePath: string
): Promise<StorageFile | null> {
  try {
    // Extract filename from path
    const filename = filePath.split("/").pop() || "file";

    // Download file from storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error(`Error downloading file from ${bucketName}/${filePath}:`, error);
      return null;
    }

    if (!data) {
      console.warn(`No data returned for ${bucketName}/${filePath}`);
      return null;
    }

    // Convert Blob to Buffer
    const buffer = await data.arrayBuffer();

    // Determine MIME type based on file extension
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const mimeTypeMap: Record<string, string> = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      txt: "text/plain",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
    };

    const mimeType = mimeTypeMap[ext] || "application/octet-stream";

    return {
      filename,
      content: Buffer.from(buffer),
      mimeType,
    };
  } catch (error) {
    console.error(`Error getting file from storage: ${error}`);
    return null;
  }
}

export async function getFilesFromStorage(
  supabase: SupabaseClient,
  bucketName: string,
  filePaths: (string | null)[]
): Promise<StorageFile[]> {
  const files: StorageFile[] = [];

  for (const filePath of filePaths) {
    if (!filePath) continue;

    const file = await getFileFromStorage(supabase, bucketName, filePath);
    if (file) {
      files.push(file);
    }
  }

  return files;
}

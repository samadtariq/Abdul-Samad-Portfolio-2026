export const MAX_UPLOAD_FILES = 20;
export const MEDIA_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf";
export function validateFiles(files) {
  if (!files.length) return "Choose at least one file.";
  if (files.length > MAX_UPLOAD_FILES)
    return "Choose a maximum of 20 files at a time.";
  return "";
}
// Reuse the authenticated single-file endpoint, sending only one file at a time.
export async function uploadFiles(files, upload, report = () => {}) {
  const problem = validateFiles(files);
  if (problem) throw new Error(problem);
  const results = [];
  for (let i = 0; i < files.length; i++) {
    report({ index: i, percent: 0, results });
    try {
      const item = await upload(files[i], (percent) =>
        report({ index: i, percent, results }),
      );
      results.push({ file: files[i], item });
    } catch (error) {
      results.push({
        file: files[i],
        error: error.message || "Upload failed.",
      });
    }
    report({ index: i, percent: 100, results });
  }
  return results;
}

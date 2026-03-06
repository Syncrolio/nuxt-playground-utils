export function normalizePlaygroundFilePath(fileName: string) {
  return `app/playground/${fileName}`.replaceAll("\\", "/");
}

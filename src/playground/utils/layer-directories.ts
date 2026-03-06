import { getLayerDirectories } from "@nuxt/kit";

export function getLayerSrcDirs() {
  const layerSrcDirs = getLayerDirectories()
    .map((layer) => layer.app)
    .filter(
      (dir: unknown): dir is string =>
        typeof dir === "string" && dir.length > 0,
    );

  // Keep first-seen order so nearer layers win on duplicate ids/files.
  return Array.from(new Set(layerSrcDirs));
}

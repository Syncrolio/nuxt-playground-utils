import { basename, resolve } from "node:path";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import type { PlaygroundUtilRecord } from "./types";
import {
  extractNumberProperty,
  extractObjectLiteral,
  extractStringProperty,
} from "./utils/playground-metadata";
import { normalizePlaygroundFilePath } from "./utils/playground-path";
import { parseJSON5 } from "confbox";

function toPascalCase(input: string) {
  return input
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => {
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })
    .join("");
}

function getPlaygroundDirectories(baseDir: string) {
  const candidates = [
    resolve(baseDir, "playground"),
    resolve(baseDir, "app/playground"),
  ];

  return Array.from(new Set(candidates));
}

export function collectPlaygroundUtils(appDirs: string[]) {
  const utilsById = new Map<string, PlaygroundUtilRecord>();
  const seenFiles = new Set<string>();

  for (const appDir of appDirs) {
    const playgroundDirs = getPlaygroundDirectories(appDir);

    for (const playgroundDir of playgroundDirs) {
      if (!existsSync(playgroundDir)) {
        continue;
      }

      const files = readdirSync(playgroundDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".vue"))
        .map((entry) => entry.name);

      for (const fileName of files) {
        const filePath = resolve(playgroundDir, fileName);
        const source = readFileSync(filePath, "utf-8");
        const objectLiteral = parseJSON5(
          extractObjectLiteral(source, "definePlaygroundUtil") || "",
        );
        console.log({ fileName, objectLiteral });
        const fallbackId = basename(fileName, ".vue");
        const fallbackName = fallbackId;
        const file = normalizePlaygroundFilePath(fileName);
        const id = objectLiteral?.id || fallbackId;

        if (utilsById.has(id) || seenFiles.has(file)) {
          continue;
        }

        const componentName = `PlaygroundUtil${toPascalCase(fallbackId)}`;

        utilsById.set(id, {
          ...objectLiteral,
          id,

          file,
          componentName,
        });
        seenFiles.add(file);
      }
    }
  }

  return Array.from(utilsById.values()).sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }

    return a.name.localeCompare(b.name);
  });
}

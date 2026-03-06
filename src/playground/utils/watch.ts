export function shouldRefreshFromWatchArgs(args: unknown[]) {
  const watchedPath = args.find((arg) => typeof arg === "string") as
    | string
    | undefined;
  if (!watchedPath) {
    return false;
  }

  const normalized = watchedPath.replaceAll("\\", "/");
  return normalized.includes("/app/playground/") && normalized.endsWith(".vue");
}

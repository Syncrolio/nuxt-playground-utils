import {
  addComponent,
  addImports,
  createResolver,
  defineNuxtModule,
} from "@nuxt/kit";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { collectPlaygroundUtils } from "./playground/collector";
import { getLayerSrcDirs } from "./playground/utils/layer-directories";
import { shouldRefreshFromWatchArgs } from "./playground/utils/watch";

export interface ModuleOptions {
  /**
   * Enable Nuxt Devtools integration.
   *
   * @default true
   */
  devtools: boolean;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-playground-utils",
    configKey: "playgroundUtils",
  },
  moduleDependencies: {
    "@nuxt/ui": {},
  },
  defaults: {
    devtools: true,
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const runtimeConfig = nuxt.options.runtimeConfig;
    const playgroundRuntimeConfig = (runtimeConfig.playgroundUtils ||= {});
    const publicRuntimeConfig = (runtimeConfig.public ||= {});
    const publicPlaygroundRuntimeConfig =
      (publicRuntimeConfig.playgroundUtils ||=
        {}) as typeof playgroundRuntimeConfig;
    const layerSrcDirs = getLayerSrcDirs();
    const resolvedSrcDirs =
      layerSrcDirs.length > 0 ? layerSrcDirs : [nuxt.options.srcDir];
    const registeredUtilComponents = new Map<string, string>();

    // Keep legacy key for compatibility with existing runtime assumptions.
    if (!playgroundRuntimeConfig.srcDir) {
      playgroundRuntimeConfig.srcDir = nuxt.options.srcDir;
    }

    if (!playgroundRuntimeConfig.srcDirs) {
      playgroundRuntimeConfig.srcDirs = resolvedSrcDirs;
    }

    if (!publicPlaygroundRuntimeConfig.srcDirs) {
      publicPlaygroundRuntimeConfig.srcDirs = resolvedSrcDirs;
    }

    const refreshUtils = () => {
      const utils = collectPlaygroundUtils(resolvedSrcDirs);

      for (const util of utils) {
        if (!util.componentName) {
          continue;
        }

        const candidatePaths = resolvedSrcDirs.flatMap((srcDir) => {
          return [
            resolve(srcDir, util.file),
            resolve(srcDir, util.file.replace(/^app\//, "")),
          ];
        });

        const filePath = candidatePaths.find((candidatePath) => {
          return existsSync(candidatePath);
        });

        if (!filePath) {
          continue;
        }

        const existingFilePath = registeredUtilComponents.get(
          util.componentName,
        );
        if (existingFilePath === filePath) {
          continue;
        }

        addComponent({
          name: util.componentName,
          filePath,
          global: true,
        });
        registeredUtilComponents.set(util.componentName, filePath);
      }

      playgroundRuntimeConfig.utils = utils;
      publicPlaygroundRuntimeConfig.utils = utils;
    };

    refreshUtils();

    addComponent({
      name: "PlaygroundDock",
      filePath: resolver.resolve("./runtime/components/PlaygroundDock.vue"),
    });

    addImports({
      name: "definePlaygroundUtil",
      from: resolver.resolve("./runtime/composables/definePlaygroundUtil"),
    });

    nuxt.hook("prepare:types", ({ references }) => {
      references.push({
        path: resolver.resolve("./runtime/types/auto-imports.d.ts"),
      });
    });

    nuxt.hook("vite:extendConfig", (config) => {
      const plugin = {
        name: "nuxt-playground-utils:auto-import-define-playground-util",
        enforce: "pre",
        transform(code, id) {
          if (!id.endsWith(".vue") && !id.includes(".vue?")) {
            return null;
          }

          const [filePath] = id.split("?");
          if (!filePath) {
            return null;
          }

          const normalizedPath = filePath.replace(/\\/g, "/");
          if (!normalizedPath.includes("/app/playground/")) {
            return null;
          }

          if (!code.includes("definePlaygroundUtil(")) {
            return null;
          }

          if (code.includes('definePlaygroundUtil } from "#imports"')) {
            return null;
          }

          const scriptSetup = code.match(/<script\s+setup[^>]*>/);
          if (!scriptSetup || scriptSetup.index === undefined) {
            return null;
          }

          const insertAt = scriptSetup.index + scriptSetup[0].length;
          return {
            code:
              code.slice(0, insertAt) +
              '\nimport { definePlaygroundUtil } from "#imports";' +
              code.slice(insertAt),
            map: null,
          };
        },
      };

      if (Array.isArray(config.plugins)) {
        config.plugins.push(plugin);
      }
    });

    // Keep all runtime features dev-only to avoid including playground tooling in builds.
    if (!nuxt.options.dev) {
      return;
    }

    nuxt.hook("builder:watch", (...args) => {
      if (!shouldRefreshFromWatchArgs(args)) {
        return;
      }

      refreshUtils();
    });
  },
});

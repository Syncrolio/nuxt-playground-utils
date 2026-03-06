import { describe, expect, it, vi } from "vitest";

const addComponent = vi.fn();
const addImports = vi.fn();

vi.mock("@nuxt/kit", () => {
  return {
    addComponent,
    addImports,
    createResolver: () => ({
      resolve: (path: string) => `/resolved/${path}`,
    }),
    getLayerDirectories: () => [
      {
        app: "/workspace/app",
      },
    ],
    defineNuxtModule: (definition: unknown) => definition,
  };
});

type HookName = "pages:extend" | "devtools:customTabs";

function createNuxt(dev: boolean) {
  const nuxt = {
    options: {
      dev,
      srcDir: "/workspace/app",
      runtimeConfig: {},
    },
    hook: (
      _name: HookName,
      _callback: (pages: Array<Record<string, unknown>>) => void,
    ) => {
      // no-op in this test
    },
  };

  return { nuxt };
}

describe("module setup", () => {
  it("registers imports and dock component", async () => {
    addComponent.mockClear();
    addImports.mockClear();

    const mod = await import("../src/module");
    const moduleDefinition = mod.default as {
      setup: (
        options: { devtools: boolean },
        nuxt: {
          options: { dev: boolean };
          hook: (
            name: HookName,
            callback: (pages: Array<Record<string, unknown>>) => void,
          ) => void;
        },
      ) => void;
    };

    const devCtx = createNuxt(true);
    moduleDefinition.setup({ devtools: true }, devCtx.nuxt);

    expect(addComponent).toHaveBeenCalledTimes(1);
    expect(addComponent).toHaveBeenCalledWith({
      name: "PlaygroundDock",
      filePath: "/resolved/./runtime/components/PlaygroundDock.vue",
    });
    expect(addImports).toHaveBeenCalledTimes(1);

    const prodCtx = createNuxt(false);
    moduleDefinition.setup({ devtools: true }, prodCtx.nuxt);

    expect(addComponent).toHaveBeenCalledTimes(2);
    expect(addImports).toHaveBeenCalledTimes(2);
  });
});

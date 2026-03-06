import { describe, expect, it, vi } from "vitest";

const runtimeConfigState: {
  playgroundUtils?: {
    utils?: Array<{
      id: string;
      name: string;
      description?: string;
      order: number;
      file: string;
    }>;
  };
} = {};

vi.mock("h3", () => {
  return {
    defineEventHandler: (handler: () => unknown) => handler,
  };
});

Object.assign(globalThis, {
  useRuntimeConfig: () => runtimeConfigState,
});

describe("runtime utils API", () => {
  it("returns utils from runtime config", async () => {
    runtimeConfigState.playgroundUtils = {
      utils: [
        {
          id: "quick-nav",
          name: "Quick Nav",
          description: "Jump to common routes",
          order: 10,
          file: "app/playground/QuickNav.vue",
        },
        {
          id: "locale-switcher",
          name: "Locale Switcher",
          description: "Switch locale while testing",
          order: 20,
          file: "app/playground/LocaleSwitcher.vue",
        },
      ],
    };

    const mod = await import("../src/runtime/server/api/utils.get");
    const handler = mod.default as () => {
      utils: Array<{
        id: string;
        name: string;
        description?: string;
        order: number;
        file: string;
      }>;
    };
    const response = handler();

    expect(response.utils).toEqual([
      {
        id: "quick-nav",
        name: "Quick Nav",
        description: "Jump to common routes",
        order: 10,
        file: "app/playground/QuickNav.vue",
      },
      {
        id: "locale-switcher",
        name: "Locale Switcher",
        description: "Switch locale while testing",
        order: 20,
        file: "app/playground/LocaleSwitcher.vue",
      },
    ]);
  });

  it("returns an empty list when runtime config has no utils", async () => {
    runtimeConfigState.playgroundUtils = undefined;

    const mod = await import("../src/runtime/server/api/utils.get");
    const handler = mod.default as () => { utils: Array<unknown> };
    const response = handler();

    expect(response).toEqual({ utils: [] });
  });

  it("returns an empty list when runtime config utils is missing", async () => {
    runtimeConfigState.playgroundUtils = {};

    const mod = await import("../src/runtime/server/api/utils.get");
    const handler = mod.default as () => { utils: Array<unknown> };
    const response = handler();

    expect(response).toEqual({ utils: [] });
  });
});

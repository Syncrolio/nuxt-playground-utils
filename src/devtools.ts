import type { Nuxt } from "nuxt/schema";
import type { Resolver } from "@nuxt/kit";
import { h } from "vue";
import type {
  PlaygroundUtilRecord,
  PlaygroundRuntimeConfig,
} from "./playground/types";
// import {NButton} from "#components"

interface DevtoolsCustomTab {
  name: string;
  title: string;
  icon?: string;
  view: {
    type: "vnode";
    vnode: ReturnType<typeof h>;
  };
}

async function renderUtilityList(utils: PlaygroundUtilRecord[]) {
  if (utils.length === 0) {
    return h(
      "p",
      { style: "margin:0;color:#6b7280" },
      "No utilities found. Add components under app/playground/*.vue.",
    );
  }

  return h(
    "ul",
    { style: "margin:8px 0 0;padding-left:18px" },
    await Promise.all(
      utils.map(async (util) =>
        h("li", { style: "margin:0 0 8px" }, [
          h("strong", util.name),
          util.description
            ? h("span", { style: "color:#6b7280" }, ` - ${util.description}`)
            : null,
        h(
          "div",
          { style: "font-family:monospace;color:#6b7280;font-size:12px" },
          util.file,
        ),
        h(
          (await import("#components"))["NButton"],
          {},
          { default: () => "Refresh" },
        ),
      ]),
    ),
  ))
}

export function setupDevToolsUI(nuxt: Nuxt, _resolver: Resolver) {
  const runtimeConfig = nuxt.options.runtimeConfig as {
    playgroundUtils?: PlaygroundRuntimeConfig;
  };
  const utils = runtimeConfig.playgroundUtils?.utils || [];

  const hookDevtoolsCustomTabs = nuxt.hook as unknown as (
    name: "devtools:customTabs",
    callback: (tabs: DevtoolsCustomTab[]) => void,
  ) => void;

  hookDevtoolsCustomTabs("devtools:customTabs", async (tabs) => {
    tabs.push({
      name: "nuxt-playground-utils",
      title: "Playground Utils",
      icon: "carbon:play-outline",
      view: {
        type: "vnode",
        vnode: h("div", { style: "padding:12px;line-height:1.5" }, [
          h("h3", { style: "margin:0 0 8px" }, "Playground Utils"),
          h(
            "p",
            { style: "margin:0 0 8px" },
            "Development utilities discovered from app/playground/*.vue:",
          ),
          await renderUtilityList(utils),
        ]),
      },
    });
  });
}

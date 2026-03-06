# Nuxt Playground Utils

[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

`@syncrolio/nuxt-playground-utils` adds a lightweight, in-app playground toolbar for Nuxt projects.

It discovers utility components from your app (including Nuxt layers), exposes utility metadata at runtime, and renders a draggable dock for fast QA and development workflows.

## Features

- Layer-aware utility discovery (`app/playground` and `playground` folders)
- Auto-registration of discovered utility components
- `definePlaygroundUtil(...)` helper for utility metadata
- In-app draggable dock component (`<PlaygroundDock />`)
- Built on Nuxt UI components

## Requirements

- Nuxt 4+

## Installation

```bash
# pnpm
pnpm add -D @syncrolio/nuxt-playground-utils

# npm
npm install -D @syncrolio/nuxt-playground-utils

# yarn
yarn add -D @syncrolio/nuxt-playground-utils

# bun
bun add -d @syncrolio/nuxt-playground-utils
```

## Setup

Add the module in your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ["@syncrolio/nuxt-playground-utils"],
});
```

Mount the dock in your app shell (recommended dev-only):

```vue
<template>
  <UApp>
    <NuxtPage />

    <DevOnly>
      <PlaygroundDock />
    </DevOnly>
  </UApp>
</template>
```

## Create Utilities

Create a Vue file in one of these folders:

- `app/playground/*.vue`
- `playground/*.vue`

Then define utility metadata:

```vue
<script setup lang="ts">
definePlaygroundUtil({
  id: "route-shortcuts",
  name: "Route Shortcuts",
  description: "Jump between key pages while testing",
  order: 10,
  icon: "carbon:compass",
});
</script>

<template>
  <div>Your utility UI goes here.</div>
</template>
```

## `definePlaygroundUtil` API

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | No | Stable identifier. Falls back to file name if omitted. |
| `name` | `string` | Yes | Display name in the dock. |
| `description` | `string` | No | Short help text shown in the popover. |
| `order` | `number` | No | Sort order (ascending). |
| `icon` | `string` | No | Icon name used for the dock action button. |

## How Discovery Works

- The module scans playground utility files from the active app and layer source directories.
- It parses `definePlaygroundUtil(...)` metadata.
- It auto-registers each utility component globally.
- It exposes utility metadata in runtime config under `runtimeConfig.public.playgroundUtils.utils`.

## Module Options

```ts
export default defineNuxtConfig({
  playgroundUtils: {
    devtools: true,
  },
});
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `devtools` | `boolean` | `true` | Enables module devtools integration behavior. |

## Development

```bash
# Install dependencies
bun install

# Generate stubs
bun run dev:prepare

# Run playground in dev mode
bun run dev

# Build module and run playground
bun run play:prod

# Lint
bun run lint

# Tests
bun run test
bun run test:watch
```

## License

MIT

[license-src]: https://img.shields.io/npm/l/@syncrolio/nuxt-playground-utils.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://opensource.org/license/mit
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt
[nuxt-href]: https://nuxt.com

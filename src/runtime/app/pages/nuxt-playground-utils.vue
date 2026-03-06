<script setup lang="ts">
import type { Component } from "vue";

interface PlaygroundUtilRecord {
  id: string;
  name: string;
  description?: string;
  order: number;
  file: string;
}

interface PlaygroundUtilsResponse {
  utils: PlaygroundUtilRecord[];
}

const { data, pending, error, refresh } =
  await useFetch<PlaygroundUtilsResponse>("/_playground-utils/utils", {
    server: false,
    default: () => ({ utils: [] }),
  });

const componentModules = import.meta.glob("~/app/playground/*.vue");
const selectedId = ref<string>("");
const selectedComponent = shallowRef<Component | null>(null);

const selectedUtil = computed(() => {
  return data.value?.utils.find((util) => util.id === selectedId.value) || null;
});

function normalizePath(path: string) {
  return path.replaceAll("\\\\", "/");
}

function resolveLoader(file: string) {
  const normalized = normalizePath(file);

  const found = Object.entries(componentModules).find(([path]) => {
    return normalizePath(path).endsWith(normalized);
  });

  return found?.[1];
}

async function loadSelectedComponent() {
  const util = selectedUtil.value;
  if (!util) {
    selectedComponent.value = null;
    return;
  }

  const loader = resolveLoader(util.file);
  if (!loader) {
    selectedComponent.value = null;
    return;
  }

  const module = await loader();
  selectedComponent.value = (module as { default: Component }).default;
}

watch(
  () => data.value?.utils,
  (utils) => {
    if (!utils || utils.length === 0) {
      selectedId.value = "";
      return;
    }

    if (
      !selectedId.value ||
      !utils.some((util) => util.id === selectedId.value)
    ) {
      selectedId.value = utils[0].id;
    }
  },
  { immediate: true },
);

watch(
  selectedUtil,
  () => {
    loadSelectedComponent();
  },
  { immediate: true },
);
</script>

<template>
  <div class="playground-utils">
    <header class="header">
      <div>
        <h1>Playground Utils</h1>
        <p>
          Run development-only utility components from
          <code>app/playground/*.vue</code>.
        </p>
      </div>
      <button class="refresh" type="button" @click="refresh()">Refresh</button>
    </header>

    <main class="layout">
      <aside class="list">
        <p v-if="pending" class="status">Loading playground utilities...</p>
        <p v-else-if="error" class="status error">Failed to load utilities.</p>
        <ul v-else>
          <li v-for="util in data?.utils || []" :key="util.id">
            <button
              type="button"
              class="util"
              :class="{ active: util.id === selectedId }"
              @click="selectedId = util.id"
            >
              <span class="name">{{ util.name }}</span>
              <span v-if="util.description" class="description">{{
                util.description
              }}</span>
            </button>
          </li>
        </ul>
      </aside>

      <section class="preview">
        <p v-if="!selectedUtil" class="status">
          No playground util found. Create one in <code>app/playground</code>.
        </p>
        <p v-else-if="!selectedComponent" class="status error">
          The component for <code>{{ selectedUtil.file }}</code> could not be
          loaded.
        </p>
        <component :is="selectedComponent" v-else />
      </section>
    </main>
  </div>
</template>

<style scoped>
.playground-utils {
  height: 100vh;
  padding: 16px;
  color: #111827;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.header p {
  margin-top: 4px;
  font-size: 14px;
  color: #334155;
}

.refresh {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #0f172a;
  padding: 8px 12px;
  cursor: pointer;
}

.layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  margin-top: 16px;
  min-height: calc(100vh - 110px);
}

.list,
.preview {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffffcc;
  backdrop-filter: blur(6px);
  padding: 12px;
  overflow: auto;
}

.list ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.util {
  width: 100%;
  text-align: left;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  padding: 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.util.active {
  border-color: #3b82f6;
  background: #dbeafe;
}

.name {
  font-weight: 600;
}

.description {
  font-size: 13px;
  color: #334155;
}

.status {
  font-size: 14px;
  color: #334155;
}

.status.error {
  color: #b91c1c;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
    min-height: unset;
  }
}
</style>

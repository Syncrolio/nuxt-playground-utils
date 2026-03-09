<script setup lang="ts">
import { useRuntimeConfig } from "#imports";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  resolveComponent,
  ref,
} from "vue";
import type { Component } from "vue";
import * as components from "#components";

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UCard = resolveComponent("UCard");
const UPopover = resolveComponent("UPopover");
const UIcon = resolveComponent("UIcon");

interface PlaygroundUtilRecord {
  id: string;
  name: string;
  description?: string;
  order: number;
  file: string;
  componentName?: string;
}

const runtimeConfig = useRuntimeConfig();
const utils = computed(
  () => runtimeConfig.public?.playgroundUtils?.utils || [],
);
const isDragging = ref(false);
const dockPosition = ref({ x: 24, y: 24 });

function getDockDimensions() {
  const width = Math.min(Math.max(260, 160 + utils.value.length * 64), 760);
  const height = 82;
  return { width, height };
}

function clampDockPosition(position: { x: number; y: number }) {
  if (typeof window === "undefined") {
    return position;
  }

  const { width, height } = getDockDimensions();
  return {
    x: Math.min(
      Math.max(8, position.x),
      Math.max(8, window.innerWidth - width - 8),
    ),
    y: Math.min(
      Math.max(8, position.y),
      Math.max(8, window.innerHeight - height - 8),
    ),
  };
}

function setDefaultDockPosition() {
  if (typeof window === "undefined") {
    return;
  }

  const { width, height } = getDockDimensions();
  dockPosition.value = clampDockPosition({
    x: (window.innerWidth - width) / 2,
    y: window.innerHeight - height - 20,
  });
}

onMounted(() => {
  setDefaultDockPosition();

  const onResize = () => {
    dockPosition.value = clampDockPosition(dockPosition.value);
  };

  window.addEventListener("resize", onResize);
  onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize);
  });
});

function getLoadedComponent(util: PlaygroundUtilRecord) {
  if (!util.componentName) {
    return null;
  }

  const component = resolveComponent(util.componentName);
  console.log(
    `Resolved component for util "${util.name}":`,
    component,
    typeof component,
    UButton,
  );
  // if (typeof component === "string") {
  //   const _component = components[util.componentName as keyof typeof components] as Component | undefined;

  //   return _component;
  // }

  return component as Component;
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) {
    return "PU";
  }

  const initials = words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return initials || "PU";
}

function startDrag(event: MouseEvent) {
  const startX = event.clientX - dockPosition.value.x;
  const startY = event.clientY - dockPosition.value.y;

  isDragging.value = true;

  const onMove = (moveEvent: MouseEvent) => {
    dockPosition.value = clampDockPosition({
      x: Math.max(8, moveEvent.clientX - startX),
      y: Math.max(8, moveEvent.clientY - startY),
    });
  };

  const onUp = () => {
    isDragging.value = false;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };

  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

function onDockMouseDown(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  if (!target) {
    return;
  }

  // Keep utility interactions clickable; drag from the rest of the dock rail.
  if (target.closest("button, [role='dialog'], .dock-popover-card")) {
    return;
  }

  startDrag(event);
}
</script>

<template>
  <div
    class="dock-root"
    :style="{ left: `${dockPosition.x}px`, top: `${dockPosition.y}px` }"
    @mousedown="onDockMouseDown"
  >
    <div
      class="dock-handle"
      :class="{ 'is-dragging': isDragging }"
      aria-label="Drag toolbar"
    >
      <UIcon name="carbon:draggable" class="dock-handle-icon" />
    </div>

    <div v-if="utils.length === 0" class="dock-empty">
      <UBadge color="neutral" variant="soft">No playground utils</UBadge>
    </div>

    <div v-else class="dock-toolbar">
      <UPopover
        v-for="util in utils"
        :key="util.id"
        mode="click"
        :content="{ align: 'start', side: 'top', sideOffset: 10 }"
      >
        <UButton
          color="primary"
          variant="ghost"
          size="xl"
          class="dock-action"
          :title="util.description || util.name"
          :icon="util.icon"
        >
          {{ !util.icon ? getInitials(util.name) : "" }}
        </UButton>

        <template #content>
          <UCard class="dock-popover-card">
            <template #header>
              <div class="dock-popover-header">
                <div>
                  <strong>{{ util.name }}</strong>
                  <p v-if="util.description" class="dock-popover-description">
                    {{ util.description }}
                  </p>
                </div>
                <UBadge color="neutral" variant="soft">
                  {{ util.id }}
                </UBadge>
              </div>
            </template>

            <component :is="util.componentName" />
            <!-- <div class="dock-popover-body"> -->
            <!-- <component :is="util.componentName" /> {{ util.componentName }}
              <p v-if="!getLoadedComponent(util)" class="dock-error-text">
                Failed to load <code>{{ util.file }}</code
                >.

                {{ util.componentName }}
                <component :is="util.componentName"/>
              </p> -->
            <!-- </div> -->
          </UCard>
        </template>
      </UPopover>
    </div>
  </div>
</template>

<style scoped>
.dock-root {
  position: fixed;
  z-index: calc(var(--spacing) * 275);
  /* min-width: calc(var(--spacing) * 65);
  max-width: min(92vw, calc(var(--spacing) * 190)); */
  display: flex;
  align-items: stretch;
  user-select: none;
  color: var(--ui-text);
  border: var(--ui-border);
  border-style: solid;
  border-width: calc(var(--spacing) * 0.25);
  border-radius: calc(var(--spacing) * 2);
  background-color: var(--ui-bg);
}

.dock-handle {
  position: relative;
  cursor: grab;
  display: flex;
  flex: 0 0 calc(var(--spacing) * 8);
  inline-size: calc(var(--spacing) * 6);
  align-items: center;
  justify-content: center;

  padding-block: calc(var(--spacing) * 1);

  color: var(--ui-text-toned);
  align-self: stretch;
}

.dock-handle::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  width: calc(var(--spacing) * 0.25);
  height: 70%;
  transform: translateY(-50%);
  background-color: var(--ui-border);
}

.dock-handle.is-dragging {
  cursor: grabbing;
}

.dock-empty {
  padding: calc(var(--spacing) * 1) calc(var(--spacing) * 3);
}

.dock-toolbar {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  /* overflow-x: auto; */
  padding: calc(var(--spacing) * 2);
  margin-right: calc(var(--spacing) * 2);
}

.dock-action {
  flex: 0 0 auto;
  width: calc(var(--spacing) * 9);
  height: calc(var(--spacing) * 9);
  color: var(--ui-text);
  font-size: calc(var(--spacing) * 2.75);
  font-weight: 800;
  transition:
    transform 140ms ease,
    border-color 140ms ease,
    background-color 140ms ease,
    box-shadow 140ms ease;
}

.dock-action:hover {
  border-color: var(--ui-primary);
  background: var(--ui-bg-muted);
  box-shadow: 0 0 0 calc(var(--spacing) * 0.5) var(--ui-primary);
}

.dock-popover-card {
  width: min(88vw, calc(var(--spacing) * 175));
  border: 1px solid var(--ui-border);
}

.dock-popover-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}

.dock-popover-description {
  margin-top: calc(var(--spacing) * 1);
  font-size: calc(var(--spacing) * 3.25);
  color: var(--ui-text-muted);
}

.dock-popover-body {
  max-height: min(62vh, calc(var(--spacing) * 130));
  overflow: auto;
}

.dock-error-text {
  margin: 0;
  color: var(--ui-error);
}
</style>

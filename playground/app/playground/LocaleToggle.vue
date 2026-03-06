<script setup lang="ts">
import { computed, useState, watchEffect } from "#imports";

definePlaygroundUtil({
  id: "locale-toggle",
  name: "Locale Toggle",
  description: "Simulate locale and text direction changes",
  order: 20,
  icon: "carbon:language",
});

const locale = useState("playground-locale", () => "en");
const direction = computed(() => (locale.value === "ar" ? "rtl" : "ltr"));

watchEffect(() => {
  if (import.meta.client) {
    document.documentElement.lang = locale.value;
    document.documentElement.dir = direction.value;
  }
});

function setLocale(value: "en" | "fr" | "ar") {
  locale.value = value;
}
</script>

<template>
  <p>
    Active locale: <code>{{ locale }}</code> | dir:
    <code>{{ direction }}</code>
  </p>
  <div class="actions">
    <UButton type="button" @click="setLocale('en')">en</UButton>
    <UButton type="button" @click="setLocale('fr')">fr</UButton>
    <UButton type="button" @click="setLocale('ar')">ar (rtl)</UButton>
  </div>
</template>

<style scoped>
.util-card {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 12px;
  background: #fff;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

button {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  padding: 8px 10px;
  cursor: pointer;
}
</style>

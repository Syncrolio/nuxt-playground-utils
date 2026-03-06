<script setup lang="ts">
import { useRoute, useRouter } from "#imports";

definePlaygroundUtil({
  id: "route-shortcuts",
  name: "Route Shortcuts",
  description: "Jump between key pages while testing",
  order: 10,
});

const router = useRouter();
const route = useRoute();

const routes = ["/", "/checkout", "/settings"];

async function goTo(path: string) {
  await router.push(path);
}
</script>

<template>
  <section class="util-card">
    <h3>
      Current route: <code>{{ route.path }}</code>
    </h3>
    <div class="actions">
      <button
        v-for="path in routes"
        :key="path"
        type="button"
        @click="goTo(path)"
      >
        Go to {{ path }}
      </button>
    </div>
  </section>
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
  flex-wrap: wrap;
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

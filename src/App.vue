<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-4">
    <h1 class="text-2xl sm:text-3xl font-bold mb-4 flex items-center">
      <Users class="mr-2" />
      Family Tree Visualization
    </h1>
    <FamilyTree />
  </div>
</template>

<script setup lang="ts">
import { Users } from 'lucide-vue-next'
import FamilyTree from './components/FamilyTree.vue'
</script>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
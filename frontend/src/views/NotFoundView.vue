<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
  <q-page class="flex flex-center">
    <div class="text-center q-pa-xl">
      <div class="text-h3 text-weight-bold q-mb-sm">404</div>
      <div class="text-subtitle1 q-mb-lg">Página no encontrada</div>
      <q-btn color="primary" label="Volver al catálogo" @click="router.push({ name: 'catalogo' })" />
    </div>
  </q-page>
</template>

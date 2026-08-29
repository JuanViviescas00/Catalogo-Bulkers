<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
  <div class="fullscreen flex flex-center bg-grey-2">
    <div class="text-center q-pa-xl">
      <div class="text-h3 text-weight-bold q-mb-sm text-primary">404</div>
      <div class="text-subtitle1 q-mb-lg text-grey-8">Página no encontrada</div>
      <q-btn color="primary" label="Volver al catálogo" @click="router.push({ name: 'catalogo' })" />
    </div>
  </div>
</template>

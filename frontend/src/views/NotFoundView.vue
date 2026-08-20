<script setup>
/**
 * /views/NotFoundView.vue
 * Vista 404 para rutas no encontradas.
 */
</script>

<template>
  <q-page class="flex flex-center">
    <div class="text-center q-pa-xl">
      <q-icon name="travel_explore" size="72px" color="grey-5" />

      <h1 class="text-h4 text-weight-bold q-mt-md q-mb-xs">404</h1>
      <p class="text-grey-7 q-mb-lg">
        La ruta que intentas abrir no existe.
      </p>

      <q-btn
        unelevated
        no-caps
        color="primary"
        icon="home"
        label="Volver al Catálogo"
        :to="{ name: 'catalogo' }"
      />
    </div>
  </q-page>
</template>

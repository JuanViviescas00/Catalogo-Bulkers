<script setup>
defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
  icono: { type: String, default: '' },
});
</script>

<template>
  <header class="encabezado-pagina">
    <div class="row items-center justify-between q-col-gutter-md">
      <div class="col-12 col-sm">
        <div class="row items-center no-wrap">
          <q-avatar v-if="icono" square size="44px" color="primary" text-color="white" class="q-mr-md encabezado-pagina__icono">
            <q-icon :name="icono" size="24px" />
          </q-avatar>

          <div>
            <h1 class="titulo-vista style-text">{{ titulo }}</h1>
            <p v-if="subtitulo" class="encabezado-pagina__subtitulo">{{ subtitulo }}</p>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-auto">
        <slot name="acciones" />
      </div>
    </div>

    <hr class="linea-titulo" />
  </header>
</template>

<style scoped>
.encabezado-pagina {
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.42);
  border: 1px solid rgba(34, 82, 66, 0.08);
  border-radius: 18px;
  padding: 24px 24px 18px;
  box-shadow: 0 8px 18px rgba(17, 29, 24, 0.06);
}

.encabezado-pagina__icono {
  border-radius: 12px;
  box-shadow: 0 8px 18px rgba(42, 127, 91, 0.18);
}

.encabezado-pagina__subtitulo {
  font-size: 14px;
  color: #5c6d68;
  margin: 6px 0 0;
}

.titulo-vista {
  color: #1c2c29;
}

.linea-titulo {
  width: 100%;
  border: 0;
  height: 2px;
  background: linear-gradient(90deg, rgba(42, 127, 91, 0.8), rgba(42, 127, 91, 0.15));
  margin: 18px 0 0;
}
</style>

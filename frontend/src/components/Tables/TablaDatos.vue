<script setup>
import { computed, ref, useSlots } from 'vue';

const props = defineProps({
  filas: { type: Array, required: true },
  columnas: { type: Array, required: true },
  cargando: { type: Boolean, default: false },
  filaClave: { type: String, default: '_id' },
  mensajeVacio: { type: String, default: 'No hay registros para mostrar' },
});

const busqueda = ref('');
const slotsPropios = ['default', 'top', 'no-data', 'acciones-tabla'];
const slots = useSlots();

const slotsReenviados = computed(() => Object.keys(slots).filter((nombre) => !slotsPropios.includes(nombre)));
</script>

<template>
  <q-table
    :rows="props.filas"
    :columns="props.columnas"
    :row-key="props.filaClave"
    :loading="props.cargando"
    :filter="busqueda"
    :rows-per-page-options="[10, 25, 50, 0]"
    :no-data-label="props.mensajeVacio"
    no-results-label="Ningún registro coincide con la búsqueda"
    loading-label="Consultando al servidor..."
    rows-per-page-label="Registros por página"
    flat
    bordered
    class="tabla-datos my-sticky-header-table"
  >
    <template #top>
      <div class="row full-width items-center q-col-gutter-sm">
        <div class="col-12 col-sm-5">
          <q-input v-model="busqueda" dense outlined clearable debounce="300" placeholder="Buscar...">
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <q-space class="gt-xs" />
        <div class="col-12 col-sm-auto">
          <slot name="acciones-tabla" />
        </div>
      </div>
    </template>

    <template v-for="nombre in slotsReenviados" :key="nombre" #[nombre]="datosDelSlot">
      <slot :name="nombre" v-bind="datosDelSlot || {}" />
    </template>

    <template #no-data>
      <div class="full-width column flex-center q-py-xl">
        <q-icon name="inbox" size="64px" color="grey-4" class="q-mb-sm" />
        <span class="empty-title">{{ props.mensajeVacio }}</span>
      </div>
    </template>
  </q-table>
</template>

<style scoped>
.tabla-datos {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(24, 77, 60, 0.1);
  box-shadow: 0 14px 26px rgba(16, 24, 21, 0.08);
  background: rgba(255, 255, 255, 0.7);
}

.tabla-datos :deep(.q-table__top) {
  background: rgba(235, 244, 237, 0.9);
  border-bottom: 1px solid rgba(24, 77, 60, 0.08);
  padding: 14px 16px;
}

.tabla-datos :deep(th) {
  background: #edf7ef !important;
  color: #1f3a32;
  font-weight: 700;
  letter-spacing: 0.02em;
  border-bottom: 1px solid rgba(24, 77, 60, 0.1) !important;
}

.tabla-datos :deep(td) {
  border-bottom: 1px solid rgba(24, 77, 60, 0.08) !important;
  color: #1d2e2a;
}

.tabla-datos :deep(.q-table__middle) {
  background: rgba(255, 255, 255, 0.5);
}

.tabla-datos :deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
}

.empty-title {
  color: #4b5d56;
}
</style>

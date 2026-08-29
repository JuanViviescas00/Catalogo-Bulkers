<script setup>
import { onMounted, ref } from 'vue';
import EncabezadoPagina from '@/components/Encabezados/EncabezadoPagina.vue';
import { postForm, get } from '@/services/api.service';
import { useNotificar } from '@/composables/useNotificar';

const { notificarOk, notificarError } = useNotificar();
const archivo = ref(null);
const tipoImportacion = ref('todos');
const cargando = ref(false);
const resultado = ref(null);
const historial = ref([]);

const opcionesTipo = [
  { label: 'Todo el catálogo', value: 'todos' },
  { label: 'Proveedores', value: 'proveedores' },
  { label: 'Categorías', value: 'categorias' },
  { label: 'roductos', value: 'productos' },
];

const cargarHistorial = async () => {
  try {
    const respuesta = await get('/imports');
    historial.value = respuesta.data || [];
  } catch (error) {
    console.error('No se pudo cargar el historial de imports', error);
  }
};

const manejarArchivo = (evento) => {
  const archivoSeleccionado = evento?.target?.files?.[0];
  archivo.value = archivoSeleccionado || null;
};

onMounted(cargarHistorial);

const importar = async () => {
  if (!archivo.value) {
    notificarError('Debes seleccionar un archivo .csv o .json');
    return;
  }

  cargando.value = true;
  resultado.value = null;

  try {
    const formData = new FormData();
    formData.append('archivo', archivo.value);
    formData.append('tipo', tipoImportacion.value);

    const respuesta = await postForm('/imports', formData);
    resultado.value = respuesta;
    notificarOk(`Importación finalizada: ${respuesta.exitosos ?? 0} registros cargados correctamente.`);
    await cargarHistorial();
    archivo.value = null;
  } catch (error) {
    notificarError(error);
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <EncabezadoPagina titulo="Importación masiva" subtitulo="Carga de productos, categorías y proveedores desde un archivo .csv o .json" icono="upload_file" />

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-lg-7">
          <q-card flat class="card-import">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">Selecciona el archivo</div>

              <q-file
                v-model="archivo"
                label="Selecciona un archivo CSV o JSON"
                accept=".csv,.json"
                outlined
                clearable
                class="q-mb-md"
              >
                <template #prepend>
                  <q-icon name="cloud_upload" color="primary" />
                </template>
              </q-file>

              <div class="text-caption text-grey-7 q-mb-md">
                Se aceptan archivos de catálogo con columnas como nombre, sku, precio, stock, categoria, proveedor y más.
              </div>

              <q-select
                v-model="tipoImportacion"
                class="q-mt-lg"
                :options="opcionesTipo"
                emit-value
                map-options
                outlined
                label="Tipo de importación"
              />

              <q-btn
                class="q-mt-lg full-width"
                color="primary"
                icon="publish"
                label="Procesar importación"
                :loading="cargando"
                :disable="!archivo || cargando"
                @click="importar"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-5">
          <q-card flat class="card-import">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">Resultado</div>

              <div v-if="!resultado" class="text-grey-7">
                La importación mostrará aquí el resumen del lote cargado.
              </div>

              <div v-else class="q-gutter-sm">
                <div class="row justify-between">
                  <span>Total</span>
                  <strong>{{ resultado.total ?? 0 }}</strong>
                </div>
                <div class="row justify-between">
                  <span>Exitosos</span>
                  <strong class="text-positive">{{ resultado.exitosos ?? 0 }}</strong>
                </div>
                <div class="row justify-between">
                  <span>Fallidos</span>
                  <strong class="text-negative">{{ resultado.fallidos ?? 0 }}</strong>
                </div>

                <div v-if="resultado.errores?.length" class="q-mt-md">
                  <div class="text-caption text-weight-medium q-mb-xs">Errores detectados</div>
                  <q-list bordered separator>
                    <q-item v-for="(error, index) in resultado.errores.slice(0, 5)" :key="index">
                      <q-item-section>
                        <div class="text-body2">Fila {{ error.fila }} · {{ error.tipo }}</div>
                        <div class="text-caption text-grey-7">{{ error.motivo }}</div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card flat class="q-mt-lg card-import">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-sm">Historial</div>
          <q-list v-if="historial.length" bordered separator>
            <q-item v-for="job in historial" :key="job._id">
              <q-item-section>
                <div class="text-body2">{{ job.archivoNombre }}</div>
                <div class="text-caption text-grey-7">{{ new Date(job.createdAt).toLocaleString() }}</div>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="job.estado === 'completed' ? 'positive' : job.estado === 'failed' ? 'negative' : 'warning'" :label="job.estado" />
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-grey-7">Todavía no hay importaciones registradas.</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.card-import {
  background: rgba(255, 255, 255, 0.78);
  border-radius: 20px;
  border: 1px solid rgba(33, 77, 63, 0.08);
  box-shadow: 0 16px 26px rgba(15, 42, 36, 0.06);
}

.border-upload {
  border: 2px dashed rgba(42, 127, 91, 0.35);
  border-radius: 16px;
  background: rgba(226, 240, 230, 0.42);
  cursor: pointer;
  transition: 0.2s ease;
}

.border-upload:hover {
  background: rgba(214, 234, 218, 0.7);
}
</style>

<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- ENCABEZADO -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-primary">Importación Masiva de Catálogos</div>
        <div class="text-caption text-grey-7">Inicia y monitorea la ingesta de catálogos desde archivos CSV y JSON</div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- FORMULARIO DE SUBIDA -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="shadow-1">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Cargar Nuevo Archivo</div>
          </q-card-section>

          <q-card-section class="q-gutter-y-md">
            <q-select
              v-model="proveedorSeleccionado"
              :options="proveedores"
              option-label="nombre"
              option-value="_id"
              emit-value
              map-options
              label="Seleccionar Proveedor *"
              outlined
              dense
              hint="Los productos importados se vincularán a este proveedor"
            />

            <q-file
              v-model="archivoAdjunto"
              label="Archivo del Catálogo (.csv o .json) *"
              outlined
              dense
              accept=".csv, .json"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <q-btn
              label="Iniciar Importación"
              icon="cloud_upload"
              color="primary"
              class="full-width text-weight-bold"
              size="lg"
              :loading="subiendo"
              :disable="!proveedorSeleccionado || !archivoAdjunto"
              @click="enviarImportacion"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- ESTADO Y SEGUIMIENTO -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="shadow-1 fit">
          <q-card-section class="bg-grey-3">
            <div class="text-h6 text-grey-9">Estado de la Importación</div>
          </q-card-section>

          <q-card-section v-if="jobActual">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle1 text-weight-bold">Job ID: {{ jobActual.importJobId }}</div>
              <q-badge :color="colorEstado(jobActual.estado)" style="font-size: 14px">
                {{ (jobActual.estado || '').toUpperCase() }}
              </q-badge>
            </div>

            <q-linear-progress
              size="25px"
              :value="(jobActual.porcentaje || 0) / 100"
              color="primary"
              class="q-mt-sm rounded-borders"
            >
              <div class="absolute-full flex flex-center text-white text-caption text-weight-bold">
                {{ jobActual.porcentaje || 0 }}% ({{ jobActual.procesados || 0 }} / {{ jobActual.total || 0 }})
              </div>
            </q-linear-progress>

            <div class="row q-col-gutter-sm q-mt-md text-center">
              <div class="col-4">
                <q-card flat bordered class="bg-blue-1">
                  <q-card-section class="q-pa-xs">
                    <div class="text-caption text-grey-8">Total Ítems</div>
                    <div class="text-h6 text-weight-bold text-primary">{{ jobActual.total || 0 }}</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-4">
                <q-card flat bordered class="bg-green-1">
                  <q-card-section class="q-pa-xs">
                    <div class="text-caption text-grey-8">Exitosos</div>
                    <div class="text-h6 text-weight-bold text-positive">{{ jobActual.exitosos || 0 }}</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-4">
                <q-card flat bordered class="bg-red-1">
                  <q-card-section class="q-pa-xs">
                    <div class="text-caption text-grey-8">Fallidos</div>
                    <div class="text-h6 text-weight-bold text-negative">{{ jobActual.fallidos || 0 }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- DETALLE DE ERRORES SI EXISTEN -->
            <div v-if="jobActual.errores && jobActual.errores.length > 0" class="q-mt-md">
              <div class="text-subtitle2 text-negative">Errores Reportados ({{ jobActual.errores.length }}):</div>
              <q-scroll-area style="height: 160px;" class="bg-grey-2 q-pa-xs rounded-borders">
                <q-list dense separator>
                  <q-item v-for="(err, idx) in jobActual.errores" :key="idx">
                    <q-item-section>
                      <q-item-label caption class="text-negative">
                        Fila {{ err.fila }} [SKU: {{ err.sku || 'N/A' }}]: {{ err.motivo }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-scroll-area>
            </div>
          </q-card-section>

          <q-card-section v-else class="text-center q-pa-xl text-grey-6">
            <q-icon name="cloud_sync" size="64px" />
            <div>No hay ninguna importación en curso.</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import apiService from '@/services/api.service';

const $q = useQuasar();

const proveedores = ref([]);
const proveedorSeleccionado = ref(null);
const archivoAdjunto = ref(null);

const subiendo = ref(false);
const jobActual = ref(null);
let timerPoll = null;

async function cargarProveedores() {
  try {
    const res = await apiService.get('/proveedores');
    const lista = Array.isArray(res) ? res : res.data || [];
    proveedores.value = lista.filter((p) => p.activo !== false);

    if (proveedores.value.length > 0) {
      proveedorSeleccionado.value = proveedores.value[0]._id;
    }
  } catch (e) {
    console.error('Error al cargar proveedores:', e);
  }
}

async function enviarImportacion() {
  subiendo.value = true;
  try {
    const formData = new FormData();
    formData.append('proveedorId', proveedorSeleccionado.value);
    formData.append('archivo', archivoAdjunto.value);

    const res = await apiService.post('/imports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    $q.notify({
      type: 'positive',
      message: '¡Importación iniciada exitosamente!',
      icon: 'check_circle',
    });

    const jobId = res.importJobId || res.data?.importJobId;
    archivoAdjunto.value = null;
    iniciarPolling(jobId);
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.mensaje || 'Error al iniciar la importación',
      icon: 'error',
    });
  } finally {
    subiendo.value = false;
  }
}

function iniciarPolling(jobId) {
  if (timerPoll) clearInterval(timerPoll);
  consultarJob(jobId);
  timerPoll = setInterval(() => consultarJob(jobId), 1000);
}

async function consultarJob(jobId) {
  try {
    const res = await apiService.get(`/imports/${jobId}`);
    jobActual.value = res.data || res;

    if (['completed', 'failed'].includes(jobActual.value.estado)) {
      clearInterval(timerPoll);
    }
  } catch (e) {
    console.error(e);
  }
}

function colorEstado(estado) {
  switch (estado) {
    case 'pending': return 'warning';
    case 'processing': return 'primary';
    case 'completed': return 'positive';
    case 'failed': return 'negative';
    default: return 'grey';
  }
}

onMounted(cargarProveedores);
onUnmounted(() => {
  if (timerPoll) clearInterval(timerPoll);
});
</script>

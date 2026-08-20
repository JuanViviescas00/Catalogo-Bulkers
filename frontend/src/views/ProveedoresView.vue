<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- ENCABEZADO -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-primary">Gestión de Proveedores</div>
        <div class="text-caption text-grey-7">CRUD administrativo de marcas y distribuidores</div>
      </div>

      <q-btn
        v-if="auth.esAdmin"
        label="Nuevo Proveedor"
        icon="add"
        color="primary"
        @click="abrirModalCrear"
      />
    </div>

    <!-- TABLA DE PROVEEDORES -->
    <q-card flat bordered class="shadow-1">
      <q-table
        :rows="proveedores"
        :columns="columnas"
        row-key="_id"
        :loading="cargando"
        flat
        bordered
      >
        <template v-slot:body-cell-activo="props">
          <q-td :props="props">
            <q-badge :color="props.value ? 'positive' : 'negative'">
              {{ props.value ? 'Activo' : 'Inactivo' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="q-gutter-x-xs">
            <q-btn
              v-if="auth.esAdmin"
              flat
              round
              dense
              color="primary"
              icon="edit"
              @click="abrirModalEditar(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn
              v-if="auth.esAdmin && props.row.activo"
              flat
              round
              dense
              color="negative"
              icon="block"
              @click="confirmarDesactivar(props.row)"
            >
              <q-tooltip>Desactivar Proveedor</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- MODAL CREAR / EDITAR -->
    <q-dialog v-model="modalAbierto" persistent>
      <q-card style="width: 450px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="bg-primary text-white row items-center justify-between">
          <div class="text-h6">{{ esEdicion ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="guardarProveedor" class="q-gutter-md">
            <q-input
              v-model="formulario.nombre"
              label="Nombre del Proveedor *"
              outlined
              dense
              :rules="[val => !!val || 'El nombre es obligatorio']"
              @update:model-value="generarSlug"
            />

            <q-input
              v-model="formulario.slug"
              label="Slug *"
              outlined
              dense
              hint="Identificador único sin espacios (ej. acme-corp)"
              :rules="[val => !!val || 'El slug es obligatorio']"
            />

            <q-input
              v-model="formulario.contactoEmail"
              label="Email de Contacto"
              type="email"
              outlined
              dense
            />

            <q-input
              v-model="formulario.logoUrl"
              label="URL del Logo"
              outlined
              dense
            />

            <div class="row justify-end q-gutter-x-sm">
              <q-btn label="Cancelar" flat color="grey-8" v-close-popup />
              <q-btn label="Guardar" type="submit" color="primary" :loading="guardando" />
            </div>
          </q-form>
        </q-card-section>
      </card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import apiService from '@/services/api.service';
import { useAuthStore } from '@/store/auth';

const $q = useQuasar();
const auth = useAuthStore();

const cargando = ref(false);
const guardando = ref(false);
const proveedores = ref([]);

const modalAbierto = ref(false);
const esEdicion = ref(false);
const proveedorIdSel = ref(null);

const formulario = ref({
  nombre: '',
  slug: '',
  contactoEmail: '',
  logoUrl: '',
});

const columnas = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'slug', label: 'Slug', field: 'slug', align: 'left', sortable: true },
  { name: 'contactoEmail', label: 'Contacto', field: row => row.contactoEmail || 'N/A', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', align: 'center' },
];

function generarSlug(nombre) {
  if (!esEdicion.value && nombre) {
    formulario.value.slug = nombre
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}

async function cargarProveedores() {
  cargando.value = true;
  try {
    const res = await apiService.get('/proveedores');
    proveedores.value = res.data?.data || [];
  } catch (e) {
    console.error(e);
  } finally {
    cargando.value = false;
  }
}

function abrirModalCrear() {
  esEdicion.value = false;
  proveedorIdSel.value = null;
  formulario.value = { nombre: '', slug: '', contactoEmail: '', logoUrl: '' };
  modalAbierto.value = true;
}

function abrirModalEditar(row) {
  esEdicion.value = true;
  proveedorIdSel.value = row._id;
  formulario.value = {
    nombre: row.nombre,
    slug: row.slug,
    contactoEmail: row.contactoEmail || '',
    logoUrl: row.logoUrl || '',
  };
  modalAbierto.value = true;
}

async function guardarProveedor() {
  guardando.value = true;
  try {
    if (esEdicion.value) {
      await apiService.put(`/proveedores/${proveedorIdSel.value}`, formulario.value);
      $q.notify({ type: 'positive', message: 'Proveedor actualizado exitosamente' });
    } else {
      await apiService.post('/proveedores', formulario.value);
      $q.notify({ type: 'positive', message: 'Proveedor creado exitosamente' });
    }
    modalAbierto.value = false;
    cargarProveedores();
  } catch (e) {
    $q.notify({ type: 'negative', message: e.mensaje || 'Error al guardar proveedor' });
  } finally {
    guardando.value = false;
  }
}

function confirmarDesactivar(row) {
  $q.dialog({
    title: 'Desactivar Proveedor',
    message: `¿Estás seguro de desactivar al proveedor "${row.nombre}"? Conservará su historial pero no aceptará nuevas importaciones.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await apiService.del(`/proveedores/${row._id}`);
      $q.notify({ type: 'positive', message: 'Proveedor desactivado correctamente' });
      cargarProveedores();
    } catch (e) {
      $q.notify({ type: 'negative', message: e.mensaje || 'Error al desactivar' });
    }
  });
}

onMounted(cargarProveedores);
</script>

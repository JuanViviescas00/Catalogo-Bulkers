<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- ENCABEZADO -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-primary">Gestión de Categorías</div>
        <div class="text-caption text-grey-7">Visualización y enriquecimiento de metadatos de categorías</div>
      </div>
    </div>

    <!-- TABLA DE CATEGORÍAS -->
    <q-card flat bordered class="shadow-1">
      <q-table
        :rows="categorias"
        :columns="columnas"
        row-key="_id"
        :loading="cargando"
        flat
        bordered
      >
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
              <q-tooltip>Enriquecer Categoría</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- MODAL EDITAR METADATOS -->
    <q-dialog v-model="modalAbierto" persistent>
      <q-card style="width: 450px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="bg-primary text-white row items-center justify-between">
          <div class="text-h6">Editar Categoría: {{ formulario.slug }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="guardarCategoria" class="q-gutter-md">
            <q-input
              v-model="formulario.nombre"
              label="Nombre Visible *"
              outlined
              dense
              :rules="[val => !!val || 'El nombre es obligatorio']"
            />

            <q-input
              v-model="formulario.descripcion"
              label="Descripción"
              type="textarea"
              outlined
              dense
              rows="2"
            />

            <q-input
              v-model="formulario.imagenUrl"
              label="URL Imagen de la Categoría"
              outlined
              dense
            />

            <div class="row justify-end q-gutter-x-sm">
              <q-btn label="Cancelar" flat color="grey-8" v-close-popup />
              <q-btn label="Guardar" type="submit" color="primary" :loading="guardando" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
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
const categorias = ref([]);

const modalAbierto = ref(false);
const categoriaIdSel = ref(null);

const formulario = ref({
  slug: '',
  nombre: '',
  descripcion: '',
  imagenUrl: '',
});

const columnas = [
  { name: 'slug', label: 'Slug', field: 'slug', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre Visible', field: 'nombre', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: row => row.descripcion || 'Sin descripción', align: 'left' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
];

async function cargarCategorias() {
  cargando.value = true;
  try {
    const res = await apiService.get('/categorias');
    categorias.value = res.data || [];
  } catch (e) {
    console.error(e);
  } finally {
    cargando.value = false;
  }
}

function abrirModalEditar(row) {
  categoriaIdSel.value = row._id;
  formulario.value = {
    slug: row.slug,
    nombre: row.nombre,
    descripcion: row.descripcion || '',
    imagenUrl: row.imagenUrl || '',
  };
  modalAbierto.value = true;
}

async function guardarCategoria() {
  guardando.value = true;
  try {
    await apiService.put(`/categorias/${categoriaIdSel.value}`, {
      nombre: formulario.value.nombre,
      descripcion: formulario.value.descripcion,
      imagenUrl: formulario.value.imagenUrl,
    });
    $q.notify({ type: 'positive', message: 'Categoría actualizada exitosamente' });
    modalAbierto.value = false;
    cargarCategorias();
  } catch (e) {
    $q.notify({ type: 'negative', message: e.mensaje || 'Error al guardar categoría' });
  } finally {
    guardando.value = false;
  }
}

onMounted(cargarCategorias);
</script>

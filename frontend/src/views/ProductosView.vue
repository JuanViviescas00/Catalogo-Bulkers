<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- ENCABEZADO -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-primary">Gestión de Productos</div>
        <div class="text-caption text-grey-7">CRUD administrativo de productos del catálogo</div>
      </div>

      <q-btn
        v-if="auth.esAdmin"
        label="Nuevo Producto"
        icon="add"
        color="primary"
        @click="abrirModalCrear"
      />
    </div>

    <!-- TABLA DE PRODUCTOS -->
    <q-card flat bordered class="shadow-1">
      <q-table
        :rows="productos"
        :columns="columnas"
        row-key="_id"
        :loading="cargando"
        flat
        bordered
      >
        <template v-slot:top-right>
          <q-input
            v-model="filtroTabla"
            placeholder="Buscar..."
            dense
            outlined
            clearable
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-precio="props">
          <q-td :props="props" class="text-weight-bold text-green-8">
            ${{ props.value.toFixed(2) }}
          </q-td>
        </template>

        <template v-slot:body-cell-disponible="props">
          <q-td :props="props">
            <q-badge :color="props.value ? 'positive' : 'negative'">
              {{ props.value ? 'Disponible' : 'Agotado' }}
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
              v-if="auth.esAdmin"
              flat
              round
              dense
              color="negative"
              icon="delete"
              @click="confirmarDesactivar(props.row)"
            >
              <q-tooltip>Desactivar (Soft Delete)</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- MODAL CREAR / EDITAR -->
    <q-dialog v-model="modalAbierto" persistent>
      <q-card style="width: 500px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="bg-primary text-white row items-center justify-between">
          <div class="text-h6">{{ esEdicion ? 'Editar Producto' : 'Crear Producto' }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="guardarProducto" class="q-gutter-md">
            <q-input
              v-model="formulario.sku"
              label="SKU *"
              outlined
              dense
              :rules="[val => !!val || 'El SKU es requerido']"
            />

            <q-input
              v-model="formulario.nombre"
              label="Nombre del Producto *"
              outlined
              dense
              :rules="[val => !!val || 'El nombre es requerido']"
            />

            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model.number="formulario.precio"
                  label="Precio *"
                  type="number"
                  step="0.01"
                  outlined
                  dense
                  :rules="[val => val >= 0 || 'El precio no puede ser negativo']"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model.number="formulario.stock"
                  label="Stock *"
                  type="number"
                  outlined
                  dense
                  :rules="[val => val >= 0 || 'El stock no puede ser negativo']"
                />
              </div>
            </div>

            <q-select
              v-model="formulario.categoria"
              :options="categorias"
              option-label="nombre"
              option-value="slug"
              emit-value
              map-options
              label="Categoría *"
              outlined
              dense
              :rules="[val => !!val || 'La categoría es requerida']"
            />

            <q-select
              v-model="formulario.proveedorId"
              :options="proveedores"
              option-label="nombre"
              option-value="_id"
              emit-value
              map-options
              label="Proveedor *"
              outlined
              dense
              :rules="[val => !!val || 'El proveedor es requerido']"
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
              label="URL Imagen Principal"
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
const productos = ref([]);
const categorias = ref([]);
const proveedores = ref([]);
const filtroTabla = ref('');

const modalAbierto = ref(false);
const esEdicion = ref(false);
const productoIdSel = ref(null);

const formulario = ref({
  sku: '',
  nombre: '',
  precio: 0,
  stock: 0,
  categoria: '',
  proveedorId: '',
  descripcion: '',
  imagenUrl: '',
});

const columnas = [
  { name: 'sku', label: 'SKU', field: 'sku', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right', sortable: true },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'center', sortable: true },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left', sortable: true },
  { name: 'disponible', label: 'Estado', field: 'disponible', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
];

async function cargarDatos() {
  cargando.value = true;
  try {
    const [resProd, resCat, resProv] = await Promise.all([
      apiService.get('/productos'),
      apiService.get('/categorias'),
      apiService.get('/proveedores'),
    ]);
    productos.value = resProd.data?.data || [];
    categorias.value = resCat.data || [];
    proveedores.value = resProv.data?.data || [];
  } catch (e) {
    console.error(e);
  } finally {
    cargando.value = false;
  }
}

function abrirModalCrear() {
  esEdicion.value = false;
  productoIdSel.value = null;
  formulario.value = {
    sku: '',
    nombre: '',
    precio: 0,
    stock: 0,
    categoria: '',
    proveedorId: '',
    descripcion: '',
    imagenUrl: '',
  };
  modalAbierto.value = true;
}

function abrirModalEditar(row) {
  esEdicion.value = true;
  productoIdSel.value = row._id;
  formulario.value = {
    sku: row.sku,
    nombre: row.nombre,
    precio: row.precio,
    stock: row.stock,
    categoria: row.categoria,
    proveedorId: row.proveedorId,
    descripcion: row.descripcion || '',
    imagenUrl: row.imagenUrl || '',
  };
  modalAbierto.value = true;
}

async function guardarProducto() {
  guardando.value = true;
  try {
    if (esEdicion.value) {
      await apiService.put(`/productos/${productoIdSel.value}`, formulario.value);
      $q.notify({ type: 'positive', message: 'Producto actualizado exitosamente' });
    } else {
      await apiService.post('/productos', formulario.value);
      $q.notify({ type: 'positive', message: 'Producto creado exitosamente' });
    }
    modalAbierto.value = false;
    cargarDatos();
  } catch (e) {
    $q.notify({ type: 'negative', message: e.mensaje || 'Error al guardar producto' });
  } finally {
    guardando.value = false;
  }
}

function confirmarDesactivar(row) {
  $q.dialog({
    title: 'Desactivar Producto',
    message: `¿Estás seguro de desactivar el producto "${row.nombre}"? (Quedará inactivo en el historial).`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await apiService.del(`/productos/${row._id}`);
      $q.notify({ type: 'positive', message: 'Producto desactivado correctamente' });
      cargarDatos();
    } catch (e) {
      $q.notify({ type: 'negative', message: e.mensaje || 'Error al desactivar' });
    }
  });
}

onMounted(cargarDatos);
</script>

<script setup>
import { computed, onMounted, ref } from 'vue';
import EncabezadoPagina from '@/components/Encabezados/EncabezadoPagina.vue';
import TablaDatos from '@/components/Tables/TablaDatos.vue';
import { get, post, put, del } from '@/services/api.service';
import { useGeneralStore } from '@/store/General';
import { useNotificar } from '@/composables/useNotificar';
import { useConfirmar } from '@/composables/useConfirmar';

const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();
const { confirmar } = useConfirmar();

const categorias = ref([]);
const proveedores = ref([]);
const productos = ref([]);
const cargando = ref(false);
const dialogo = ref(false);
const editando = ref(null);
const guardando = ref(false);

const formulario = ref({
  sku: '',
  nombre: '',
  precio: 0,
  stock: 0,
  categoria: '',
  descripcion: '',
  imagenUrl: '',
  proveedorId: '',
  disponible: true,
});

const columnas = [
  { name: 'sku', label: 'SKU', field: 'sku', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right', sortable: true },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'center', sortable: true },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left', sortable: true },
  { name: 'disponible', label: 'Disponible', field: 'disponible', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'right' },
];

const proveedoresOptions = computed(() => proveedores.value.map((p) => ({ label: p.nombre, value: p._id })));
const categoriasOptions = computed(() => categorias.value.map((c) => ({ label: c.nombre, value: c.slug })));

const cargar = async () => {
  cargando.value = true;
  try {
    const [listaProductos, listaCategorias, listaProveedores] = await Promise.all([
      get('/productos'),
      get('/categorias'),
      get('/proveedores'),
    ]);

    productos.value = listaProductos.data || [];
    categorias.value = listaCategorias || [];
    proveedores.value = listaProveedores.data || [];
    general.marcarSincronizacion();
  } catch (e) {
    notificarError(e);
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);

const abrirCreacion = () => {
  editando.value = null;
  formulario.value = {
    sku: '',
    nombre: '',
    precio: 0,
    stock: 0,
    categoria: categorias.value[0]?.slug || '',
    descripcion: '',
    imagenUrl: '',
    proveedorId: proveedores.value[0]?._id || '',
    disponible: true,
  };
  dialogo.value = true;
};

const abrirEdicion = (producto) => {
  editando.value = producto;
  formulario.value = {
    sku: producto.sku,
    nombre: producto.nombre,
    precio: producto.precio,
    stock: producto.stock,
    categoria: producto.categoria,
    descripcion: producto.descripcion || '',
    imagenUrl: producto.imagenUrl || '',
    proveedorId: producto.proveedorId,
    disponible: producto.disponible,
  };
  dialogo.value = true;
};

const guardar = async () => {
  guardando.value = true;
  try {
    const payload = {
      sku: formulario.value.sku.trim(),
      nombre: formulario.value.nombre.trim(),
      precio: Number(formulario.value.precio),
      stock: Number(formulario.value.stock),
      categoria: formulario.value.categoria,
      descripcion: formulario.value.descripcion.trim(),
      imagenUrl: formulario.value.imagenUrl.trim(),
      proveedorId: formulario.value.proveedorId,
      disponible: formulario.value.disponible,
    };

    if (editando.value) {
      await put(`/productos/${editando.value._id}`, payload);
      notificarOk('Producto actualizado');
    } else {
      await post('/productos', payload);
      notificarOk('Producto creado');
    }

    dialogo.value = false;
    await cargar();
  } catch (e) {
    notificarError(e);
  } finally {
    guardando.value = false;
  }
};

const eliminarProducto = async (producto) => {
  const confirmado = await confirmar({
    titulo: 'Desactivar producto',
    mensaje: `¿Deseas desactivar ${producto.nombre}?`,
    textoOk: 'Desactivar',
    color: 'negative',
  });

  if (!confirmado) return;

  try {
    await del(`/productos/${producto._id}`);
    notificarOk('Producto desactivado');
    await cargar();
  } catch (e) {
    notificarError(e);
  }
};
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <EncabezadoPagina titulo="Productos" subtitulo="Gestión del catálogo de productos" icono="inventory_2">
        <template #acciones>
          <q-btn unelevated no-caps color="primary" icon="add" label="Nuevo producto" @click="abrirCreacion" />
        </template>
      </EncabezadoPagina>

      <TablaDatos :filas="productos" :columnas="columnas" :cargando="cargando" mensaje-vacio="No hay productos registrados">
        <template #body-cell-disponible="slotProps">
          <q-td :props="slotProps" class="text-center">
            <q-badge :color="slotProps.row.disponible ? 'positive' : 'grey-6'" :label="slotProps.row.disponible ? 'Sí' : 'No'" />
          </q-td>
        </template>

        <template #body-cell-acciones="slotProps">
          <q-td :props="slotProps" class="text-right">
            <q-btn flat dense round size="sm" icon="edit" color="primary" @click="abrirEdicion(slotProps.row)" />
            <q-btn flat dense round size="sm" icon="delete" color="negative" @click="eliminarProducto(slotProps.row)" />
          </q-td>
        </template>
      </TablaDatos>
    </div>
  </q-page>

  <q-dialog v-model="dialogo" persistent>
    <q-card style="min-width: 600px; max-width: 90vw;">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">{{ editando ? 'Editar producto' : 'Nuevo producto' }}</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="formulario.sku" outlined dense label="SKU" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="formulario.nombre" outlined dense label="Nombre" />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model.number="formulario.precio" outlined dense label="Precio" type="number" />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model.number="formulario.stock" outlined dense label="Stock" type="number" />
          </div>
          <div class="col-12 col-md-4">
            <q-select v-model="formulario.disponible" :options="[{label:'Disponible', value:true},{label:'No disponible', value:false}]" emit-value map-options outlined dense label="Disponibilidad" />
          </div>
          <div class="col-12 col-md-6">
            <q-select v-model="formulario.categoria" :options="categoriasOptions" emit-value map-options outlined dense label="Categoría" />
          </div>
          <div class="col-12 col-md-6">
            <q-select v-model="formulario.proveedorId" :options="proveedoresOptions" emit-value map-options outlined dense label="Proveedor" />
          </div>
          <div class="col-12">
            <q-input v-model="formulario.descripcion" outlined dense type="textarea" autogrow label="Descripción" />
          </div>
          <div class="col-12">
            <q-input v-model="formulario.imagenUrl" outlined dense label="URL de imagen" />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
        <q-btn unelevated label="Guardar" color="primary" :loading="guardando" @click="guardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

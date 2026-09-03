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
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right', sortable: true, format: (v) => `$${Number(v || 0).toLocaleString()}` },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'center', sortable: true },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left', sortable: true },
  { name: 'estado', label: 'Estado', field: 'activo', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'right' },
];

const proveedoresOptions = computed(() => proveedores.value.map((p) => ({ label: p.nombre, value: p._id })));
const categoriasOptions = computed(() => categorias.value.map((c) => ({ label: c.nombre, value: c.slug })));

const extraerLista = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.data)) return res.data.data;
  return [];
};

const cargar = async () => {
  cargando.value = true;
  try {
    const [listaProductos, listaCategorias, listaProveedores] = await Promise.all([
      get('/productos?todos=true'),
      get('/categorias'),
      get('/proveedores'),
    ]);

    productos.value = extraerLista(listaProductos);
    categorias.value = extraerLista(listaCategorias);
    proveedores.value = extraerLista(listaProveedores);
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

const cambiarEstado = async (producto) => {
  const nuevoEstado = producto.activo === false;
  const accionTexto = nuevoEstado ? 'activar' : 'desactivar';
  const confirmado = await confirmar({
    titulo: nuevoEstado ? 'Activar producto' : 'Desactivar producto',
    mensaje: `¿Deseas ${accionTexto} el producto "${producto.nombre}" (${producto.sku}) para la trazabilidad de inventario?`,
    textoOk: nuevoEstado ? 'Activar' : 'Desactivar',
    color: nuevoEstado ? 'positive' : 'negative',
  });

  if (!confirmado) return;

  try {
    await put(`/productos/${producto._id}`, {
      activo: nuevoEstado,
      disponible: nuevoEstado ? Number(producto.stock) > 0 : false,
    });
    notificarOk(`Producto ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
    await cargar();
  } catch (e) {
    notificarError(e);
  }
};
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <EncabezadoPagina titulo="Productos" subtitulo="Gestión y trazabilidad del catálogo de productos" icono="inventory_2">
        <template #acciones>
          <q-btn unelevated no-caps color="primary" icon="add" label="Nuevo producto" @click="abrirCreacion" />
        </template>
      </EncabezadoPagina>

      <TablaDatos :filas="productos" :columnas="columnas" :cargando="cargando" mensaje-vacio="No hay productos registrados">
        <template #body-cell-estado="slotProps">
          <q-td :props="slotProps" class="text-center">
            <q-badge
              :color="slotProps.row.activo !== false ? (slotProps.row.stock > 0 ? 'positive' : 'warning') : 'grey-7'"
              :label="slotProps.row.activo !== false ? (slotProps.row.stock > 0 ? 'Activo' : 'Sin stock') : 'Inactivo'"
            />
          </q-td>
        </template>

        <template #body-cell-acciones="slotProps">
          <q-td :props="slotProps" class="text-right q-gutter-x-xs">
            <q-btn 
              flat 
              round 
              size="md" 
              icon="edit" 
              color="primary" 
              @click="abrirEdicion(slotProps.row)" 
            >
              <q-tooltip>Editar producto</q-tooltip>
            </q-btn>
            <q-btn 
              flat 
              round 
              size="md" 
              :icon="slotProps.row.activo !== false ? 'toggle_on' : 'toggle_off'" 
              :color="slotProps.row.activo !== false ? 'negative' : 'positive'" 
              @click="cambiarEstado(slotProps.row)" 
            >
              <q-tooltip>{{ slotProps.row.activo !== false ? 'Desactivar producto' : 'Activar producto' }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>

      </TablaDatos>
    </div>

    <q-dialog v-model="dialogo" persistent>
      <q-card style="width: 650px; max-width: 95vw; border-radius: 16px;">
        <q-card-section class="bg-primary text-white row items-center justify-between">
          <div class="text-h6 text-weight-bold">{{ editando ? 'Editar Producto' : 'Nuevo Producto' }}</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6 q-mb-xs">
              <q-input v-model="formulario.sku" outlined dense label="SKU *" />
            </div>
            <div class="col-12 col-md-6 q-mb-xs">
              <q-input v-model="formulario.nombre" outlined dense label="Nombre del Producto *" />
            </div>
            <div class="col-12 col-md-4 q-mb-xs">
              <q-input v-model.number="formulario.precio" outlined dense label="Precio ($) *" type="number" />
            </div>
            <div class="col-12 col-md-4 q-mb-xs">
              <q-input v-model.number="formulario.stock" outlined dense label="Stock *" type="number" />
            </div>
            <div class="col-12 col-md-4 q-mb-xs">
              <q-select v-model="formulario.disponible" :options="[{label:'Disponible', value:true},{label:'No disponible', value:false}]" emit-value map-options outlined dense label="Estado" />
            </div>
            <div class="col-12 col-md-6 q-mb-xs">
              <q-select v-model="formulario.categoria" :options="categoriasOptions" emit-value map-options outlined dense label="Categoría" />
            </div>
            <div class="col-12 col-md-6 q-mb-xs">
              <q-select v-model="formulario.proveedorId" :options="proveedoresOptions" emit-value map-options outlined dense label="Proveedor" />
            </div>
            <div class="col-12 q-mb-xs">
              <q-input v-model="formulario.descripcion" outlined dense type="textarea" rows="2" label="Descripción" />
            </div>
            <div class="col-12">
              <q-input v-model="formulario.imagenUrl" outlined dense label="URL de Imagen (Opcional)" />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1 q-pa-md">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated label="Guardar" color="primary" class="text-weight-bold" :loading="guardando" @click="guardar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

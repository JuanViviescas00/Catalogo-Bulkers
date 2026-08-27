<script setup>
import { onMounted, ref } from 'vue';
import EncabezadoPagina from '@/components/Encabezados/EncabezadoPagina.vue';
import TablaDatos from '@/components/Tables/TablaDatos.vue';
import { get, post, put, del } from '@/services/api.service';
import { useGeneralStore } from '@/store/General';
import { useNotificar } from '@/composables/useNotificar';
import { useConfirmar } from '@/composables/useConfirmar';

const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();
const { confirmar } = useConfirmar();

const columnas = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'slug', label: 'Slug', field: 'slug', align: 'left', sortable: true },
  { name: 'contactoEmail', label: 'Email', field: 'contactoEmail', align: 'left', sortable: true },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'right' },
];

const proveedores = ref([]);
const cargando = ref(false);
const dialogo = ref(false);
const cargandoGuardar = ref(false);
const editando = ref(null);

const formulario = ref({
  nombre: '',
  slug: '',
  contactoEmail: '',
  logoUrl: '',
});

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
    const respuesta = await get('/proveedores');
    proveedores.value = extraerLista(respuesta);
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
  formulario.value = { nombre: '', slug: '', contactoEmail: '', logoUrl: '' };
  dialogo.value = true;
};

const abrirEdicion = (proveedor) => {
  editando.value = proveedor;
  formulario.value = {
    nombre: proveedor.nombre,
    slug: proveedor.slug,
    contactoEmail: proveedor.contactoEmail || '',
    logoUrl: proveedor.logoUrl || '',
  };
  dialogo.value = true;
};

const guardar = async () => {
  cargandoGuardar.value = true;
  try {
    const payload = {
      nombre: formulario.value.nombre.trim(),
      slug: formulario.value.slug.trim(),
      contactoEmail: formulario.value.contactoEmail.trim(),
      logoUrl: formulario.value.logoUrl.trim(),
    };

    if (editando.value) {
      await put(`/proveedores/${editando.value._id}`, payload);
      notificarOk('Proveedor actualizado');
    } else {
      await post('/proveedores', payload);
      notificarOk('Proveedor creado');
    }

    dialogo.value = false;
    await cargar();
  } catch (e) {
    notificarError(e);
  } finally {
    cargandoGuardar.value = false;
  }
};

const cambiarEstado = async (proveedor) => {
  const confirmado = await confirmar({
    titulo: proveedor.activo ? 'Desactivar proveedor' : 'Activar proveedor',
    mensaje: `¿Deseas ${proveedor.activo ? 'desactivar' : 'activar'} a ${proveedor.nombre}?`,
    textoOk: proveedor.activo ? 'Desactivar' : 'Activar',
    color: proveedor.activo ? 'negative' : 'primary',
  });

  if (!confirmado) return;

  try {
    await del(`/proveedores/${proveedor._id}`);
    notificarOk('Proveedor actualizado');
    await cargar();
  } catch (e) {
    notificarError(e);
  }
};
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <EncabezadoPagina titulo="Proveedores" subtitulo="Gestión de proveedores del catálogo" icono="local_shipping">
        <template #acciones>
          <q-btn unelevated no-caps color="primary" icon="add" label="Nuevo proveedor" @click="abrirCreacion" />
        </template>
      </EncabezadoPagina>

      <TablaDatos :filas="proveedores" :columnas="columnas" :cargando="cargando" mensaje-vacio="No hay proveedores registrados">
        <template #body-cell-activo="slotProps">
          <q-td :props="slotProps" class="text-center">
            <q-badge :color="slotProps.row.activo ? 'positive' : 'grey-6'" :label="slotProps.row.activo ? 'Activo' : 'Inactivo'" />
          </q-td>
        </template>

        <template #body-cell-acciones="slotProps">
          <q-td :props="slotProps" class="text-right">
            <q-btn flat dense round size="sm" icon="edit" color="primary" @click="abrirEdicion(slotProps.row)" />
            <q-btn flat dense round size="sm" :icon="slotProps.row.activo ? 'toggle_on' : 'toggle_off'" :color="slotProps.row.activo ? 'negative' : 'positive'" @click="cambiarEstado(slotProps.row)" />
          </q-td>
        </template>
      </TablaDatos>
    </div>
  </q-page>

  <q-dialog v-model="dialogo" persistent>
    <q-card style="width: 500px; max-width: 95vw; border-radius: 16px;">
      <q-card-section class="bg-primary text-white row items-center justify-between">
        <div class="text-h6 text-weight-bold">{{ editando ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</div>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md q-gutter-y-sm">
        <q-input v-model="formulario.nombre" outlined dense label="Nombre del Proveedor *" />
        <q-input v-model="formulario.slug" outlined dense label="Slug (Identificador)" />
        <q-input v-model="formulario.contactoEmail" outlined dense label="Email de Contacto" type="email" />
        <q-input v-model="formulario.logoUrl" outlined dense label="URL del Logo (Opcional)" />
      </q-card-section>

      <q-card-actions align="right" class="bg-grey-1 q-pa-md">
        <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
        <q-btn unelevated label="Guardar" color="primary" class="text-weight-bold" :loading="cargandoGuardar" @click="guardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

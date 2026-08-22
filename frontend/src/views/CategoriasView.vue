<script setup>
import { onMounted, ref } from 'vue';
import EncabezadoPagina from '@/components/Encabezados/EncabezadoPagina.vue';
import TablaDatos from '@/components/Tables/TablaDatos.vue';
import { get, post, put } from '@/services/api.service';
import { useGeneralStore } from '@/store/General';
import { useNotificar } from '@/composables/useNotificar';

const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();

const columnas = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'slug', label: 'Slug', field: 'slug', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left', sortable: false },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'right' },
];

const categorias = ref([]);
const cargando = ref(false);
const dialogo = ref(false);
const seleccion = ref(null);
const formulario = ref({ nombre: '', descripcion: '', imagenUrl: '' });
const guardando = ref(false);

const cargar = async () => {
  cargando.value = true;
  try {
    const respuesta = await get('/categorias');
    categorias.value = respuesta || [];
    general.marcarSincronizacion();
  } catch (e) {
    notificarError(e);
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);

const abrirCreacion = () => {
  seleccion.value = null;
  formulario.value = { nombre: '', descripcion: '', imagenUrl: '' };
  dialogo.value = true;
};

const abrirEdicion = (categoria) => {
  seleccion.value = categoria;
  formulario.value = {
    nombre: categoria.nombre,
    descripcion: categoria.descripcion || '',
    imagenUrl: categoria.imagenUrl || '',
  };
  dialogo.value = true;
};

const guardar = async () => {
  guardando.value = true;
  try {
    const payload = {
      nombre: formulario.value.nombre.trim(),
      descripcion: formulario.value.descripcion.trim(),
      imagenUrl: formulario.value.imagenUrl.trim(),
    };

    if (seleccion.value) {
      await put(`/categorias/${seleccion.value._id}`, payload);
      notificarOk('Categoría actualizada');
    } else {
      await post('/categorias', payload);
      notificarOk('Categoría creada');
    }

    dialogo.value = false;
    await cargar();
  } catch (e) {
    notificarError(e);
  } finally {
    guardando.value = false;
  }
};
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <EncabezadoPagina titulo="Categorías" subtitulo="Administración de categorías del catálogo" icono="category">
        <template #acciones>
          <q-btn unelevated no-caps color="primary" icon="add" label="Nueva categoría" @click="abrirCreacion" />
        </template>
      </EncabezadoPagina>

      <TablaDatos :filas="categorias" :columnas="columnas" :cargando="cargando" mensaje-vacio="No hay categorías registradas">
        <template #body-cell-acciones="slotProps">
          <q-td :props="slotProps" class="text-right">
            <q-btn flat dense round size="sm" icon="edit" color="primary" @click="abrirEdicion(slotProps.row)" />
          </q-td>
        </template>
      </TablaDatos>
    </div>
  </q-page>

  <q-dialog v-model="dialogo" persistent>
    <q-card style="min-width: 500px; max-width: 90vw;">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">{{ seleccion ? 'Editar categoría' : 'Nueva categoría' }}</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="formulario.nombre" outlined dense label="Nombre" />
        <q-input v-model="formulario.descripcion" outlined dense label="Descripción" />
        <q-input v-model="formulario.imagenUrl" outlined dense label="URL de imagen" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
        <q-btn unelevated label="Guardar" color="primary" :loading="guardando" @click="guardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

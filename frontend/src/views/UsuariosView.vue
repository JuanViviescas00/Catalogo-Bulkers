<script setup>
import { onMounted, ref } from 'vue';
import EncabezadoPagina from '@/components/Encabezados/EncabezadoPagina.vue';
import TablaDatos from '@/components/Tables/TablaDatos.vue';
import { get, post } from '@/services/api.service';
import { useGeneralStore } from '@/store/General';
import { useNotificar } from '@/composables/useNotificar';

const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();

const usuarios = ref([]);
const cargando = ref(false);
const dialogo = ref(false);
const guardando = ref(false);

const formulario = ref({ email: '', password: '', rol: 'user' });

const usuariosLocales = ref([]);

const columnas = [
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'rol', label: 'Rol', field: 'rol', align: 'left', sortable: true },
];

const cargar = async () => {
  cargando.value = true;
  try {
    usuarios.value = usuariosLocales.value.length ? usuariosLocales.value : [];
    general.marcarSincronizacion();
  } catch (e) {
    notificarError(e);
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);

const abrirCreacion = () => {
  formulario.value = { email: '', password: '', rol: 'user' };
  dialogo.value = true;
};

const guardar = async () => {
  guardando.value = true;
  try {
    const respuesta = await post('/auth/register', {
      email: formulario.value.email.trim(),
      password: formulario.value.password,
      rol: formulario.value.rol,
    });

    usuariosLocales.value = [
      { _id: respuesta?._id || Date.now(), email: formulario.value.email.trim(), rol: formulario.value.rol },
      ...usuariosLocales.value,
    ];
    usuarios.value = usuariosLocales.value;
    notificarOk('Usuario creado');
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
      <EncabezadoPagina titulo="Usuarios" subtitulo="Usuarios del sistema" icono="people">
        <template #acciones>
          <q-btn unelevated no-caps color="primary" icon="person_add" label="Nuevo usuario" @click="abrirCreacion" />
        </template>
      </EncabezadoPagina>

      <TablaDatos :filas="usuarios" :columnas="columnas" :cargando="cargando" mensaje-vacio="No hay usuarios registrados" />
    </div>
  </q-page>

  <q-dialog v-model="dialogo" persistent>
    <q-card style="width: 480px; max-width: 95vw; border-radius: 16px;">
      <q-card-section class="bg-primary text-white row items-center justify-between">
        <div class="text-h6 text-weight-bold">Crear Usuario</div>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md q-gutter-y-sm">
        <q-input v-model="formulario.email" outlined dense label="Email *" type="email" />
        <q-input v-model="formulario.password" outlined dense label="Contraseña *" type="password" />
        <q-select v-model="formulario.rol" :options="[{label:'Usuario Estándar', value:'user'},{label:'Administrador', value:'admin'}]" emit-value map-options outlined dense label="Rol del Usuario *" />
      </q-card-section>

      <q-card-actions align="right" class="bg-grey-1 q-pa-md">
        <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
        <q-btn unelevated label="Guardar" color="primary" class="text-weight-bold" :loading="guardando" @click="guardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

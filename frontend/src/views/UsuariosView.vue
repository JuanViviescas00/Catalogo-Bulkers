<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- ENCABEZADO -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-primary">Gestión de Usuarios</div>
        <div class="text-caption text-grey-7">Registro de nuevos usuarios y asignación de roles</div>
      </div>

      <q-btn
        v-if="auth.esAdmin"
        label="Registrar Usuario"
        icon="person_add"
        color="primary"
        @click="modalAbierto = true"
      />
    </div>

    <!-- TARJETA INFORMATIVA -->
    <q-card flat bordered class="shadow-1 q-mb-md bg-blue-1">
      <q-card-section class="row items-center">
        <q-icon name="info" color="primary" size="32px" class="q-mr-md" />
        <div>
          <div class="text-subtitle1 text-weight-bold text-primary">Control de Acceso</div>
          <div class="text-caption text-grey-8">
            Los usuarios con rol <strong>admin</strong> tienen acceso completo para crear, modificar y desactivar registros. Los usuarios con rol <strong>user</strong> disponen de acceso de lectura.
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- MODAL REGISTRO DE USUARIO -->
    <q-dialog v-model="modalAbierto" persistent>
      <q-card style="width: 400px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="bg-primary text-white row items-center justify-between">
          <div class="text-h6">Registrar Nuevo Usuario</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="registrarUsuario" class="q-gutter-md">
            <q-input
              v-model="formulario.email"
              label="Correo Electrónico *"
              type="email"
              outlined
              dense
              :rules="[val => !!val || 'El correo es obligatorio']"
            />

            <q-input
              v-model="formulario.password"
              label="Contraseña *"
              type="password"
              outlined
              dense
              :rules="[val => !!val || 'La contraseña es obligatoria']"
            />

            <q-select
              v-model="formulario.rol"
              :options="['user', 'admin']"
              label="Rol *"
              outlined
              dense
            />

            <div class="row justify-end q-gutter-x-sm">
              <q-btn label="Cancelar" flat color="grey-8" v-close-popup />
              <q-btn label="Registrar" type="submit" color="primary" :loading="guardando" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from '@/store/auth';

const $q = useQuasar();
const auth = useAuthStore();

const modalAbierto = ref(false);
const guardando = ref(false);

const formulario = ref({
  email: '',
  password: '',
  rol: 'user',
});

async function registrarUsuario() {
  guardando.value = true;
  try {
    await auth.registrar(formulario.value);
    $q.notify({
      type: 'positive',
      message: `Usuario ${formulario.value.email} registrado exitosamente como ${formulario.value.rol}`,
      icon: 'check_circle',
    });
    modalAbierto.value = false;
    formulario.value = { email: '', password: '', rol: 'user' };
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.mensaje || 'Error al registrar usuario',
      icon: 'error',
    });
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <q-page class="bg-grey-2 flex flex-center">
    <q-card class="q-pa-md shadow-5 flex-center" style="width: 400px; max-width: 90vw; border-radius: 12px">
      <q-card-section class="text-center">
        <q-avatar size="72px" class="bg-primary text-white q-mb-sm shadow-3">
          <q-icon name="shopping_bag" />
        </q-avatar>
        <div class="text-h5 text-weight-bold text-primary">CatálogoBulk</div>
        <div class="text-caption text-grey-7">Inicia sesión con tu cuenta</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="alEnviar" class="q-gutter-md">
          <q-input
            v-model="formulario.email"
            label="Correo electrónico"
            type="email"
            outlined
            dense
            lazy-rules
            :rules="[val => !!val || 'El correo es obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="formulario.password"
            label="Contraseña"
            :type="mostrarPassword ? 'text' : 'password'"
            outlined
            dense
            lazy-rules
            :rules="[val => !!val || 'La contraseña es obligatoria']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="mostrarPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="mostrarPassword = !mostrarPassword"
              />
            </template>
          </q-input>

          <div>
            <q-btn
              label="Iniciar Sesión"
              type="submit"
              color="primary"
              class="full-width text-weight-bold"
              size="lg"
              :loading="cargando"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const $q = useQuasar();
const auth = useAuthStore();

const cargando = ref(false);
const mostrarPassword = ref(false);

const formulario = ref({
  email: '',
  password: '',
});

async function alEnviar() {
  cargando.value = true;
  try {
    await auth.login(formulario.value);
    $q.notify({
      type: 'positive',
      message: '¡Bienvenido a CatálogoBulk!',
      icon: 'check_circle',
      position: 'top-right',
    });
    router.push('/catalogo');
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.mensaje || 'Error al iniciar sesión. Revisa tus credenciales.',
      icon: 'error',
      position: 'top-right',
    });
  } finally {
    cargando.value = false;
  }
}
</script>

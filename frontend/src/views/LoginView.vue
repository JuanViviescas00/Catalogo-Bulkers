<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { post } from '@/services/api.service';
import { useAuthStore } from '@/store/Auth';
import { useGeneralStore } from '@/store/General';
import { useNotificar } from '@/composables/useNotificar';

const router = useRouter();
const auth = useAuthStore();
const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();

const formulario = ref({ email: '', password: '' });
const verPassword = ref(false);
const enviando = ref(false);

const iniciarSesion = async () => {
  enviando.value = true;

  try {
    const respuesta = await post('/auth/login', {
      email: formulario.value.email.trim(),
      password: formulario.value.password,
    });

    auth.guardarSesion(respuesta);
    notificarOk(`Bienvenido`);
    router.push({ name: 'proveedores' });
  } catch (e) {
    notificarError(e);
  } finally {
    enviando.value = false;
  }
};
</script>

<template>
  <div class="login-shell">
    <div class="login-panel animated zoomIn">
      <div class="login-panel__side">
        <div class="login-panel__brand">
          <div class="login-panel__badge">
            <q-icon name="admin_panel_settings" size="28px" />
          </div>
          <div>
            <p class="login-panel__eyebrow">Panel administrativo</p>
            <h2>{{ general.titulo }}</h2>
          </div>
        </div>

        <div class="login-panel__text">
          <p>Gestiona proveedores, categorías, productos y usuarios desde un único lugar.</p>
        </div>
      </div>

      <div class="login-panel__form-wrap">
        <q-card flat class="login-card">
          <q-card-section class="text-center q-pb-xs">
            <q-avatar size="58px" color="primary" text-color="white" class="q-mb-sm login-avatar">
              <q-icon name="storefront" size="32px" />
            </q-avatar>
            <div class="text-h5 text-weight-bold">Iniciar sesión</div>
            <p class="texto-suave text-body2 q-mb-none">Accede al administrador del catálogo</p>
          </q-card-section>

          <q-form greedy @submit="iniciarSesion">
            <q-card-section class="q-gutter-md">
              <q-input v-model="formulario.email" outlined dense label="Email" type="email" autocomplete="email" autofocus>
                <template #prepend>
                  <q-icon name="mail" />
                </template>
              </q-input>

              <q-input v-model="formulario.password" outlined dense label="Contraseña" autocomplete="current-password" :type="verPassword ? 'text' : 'password'">
                <template #prepend>
                  <q-icon name="lock" />
                </template>
                <template #append>
                  <q-icon :name="verPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="verPassword = !verPassword" />
                </template>
              </q-input>
            </q-card-section>

            <q-card-actions class="q-px-md q-pb-md">
              <q-btn unelevated no-caps type="submit" color="primary" class="full-width login-btn" label="Entrar" :loading="enviando" />
            </q-card-actions>
          </q-form>
        </q-card>

        <p class="text-center text-caption texto-suave q-mt-md q-mb-none login-api">
          <q-icon name="dns" size="14px" class="q-mr-xs" />{{ general.urlApi }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #edf3ff 0%, #dfeaf7 35%, #eef3ef 100%);
}

.login-panel {
  width: min(920px, 100%);
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(19, 47, 78, 0.08);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(19, 37, 54, 0.12);
  backdrop-filter: blur(6px);
}

.login-panel__side {
  background: linear-gradient(180deg, #132f48 0%, #1f3d5c 100%);
  color: white;
  padding: 34px 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
}

.login-panel__brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.login-panel__badge {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.login-panel__eyebrow {
  margin: 0 0 4px;
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.68);
}

.login-panel__brand h2 {
  margin: 0;
  font-size: clamp(1.5rem, 2vw, 2.2rem);
  font-weight: 800;
  line-height: 1.1;
}

.login-panel__text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.7;
  margin: 0;
}

.login-panel__form-wrap {
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-card {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(22, 52, 78, 0.08);
  box-shadow: 0 18px 32px rgba(22, 39, 53, 0.06);
}

.login-avatar {
  box-shadow: 0 12px 22px rgba(44, 92, 147, 0.16);
}

.login-btn {
  height: 46px !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  letter-spacing: 0.02em;
}

.login-api {
  letter-spacing: 0.02em;
}

@media (max-width: 760px) {
  .login-panel {
    grid-template-columns: 1fr;
  }

  .login-panel__side {
    padding-bottom: 20px;
  }
}
</style>

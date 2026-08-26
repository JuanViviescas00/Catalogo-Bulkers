import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref(null);
    const usuario = ref(null);

    const estaAutenticado = computed(() => !!token.value);
    const nombreUsuario = computed(() => usuario.value?.email || 'Usuario');

    function guardarSesion(respuesta) {
      const payload = respuesta?.usuario || respuesta?.user || { email: respuesta?.email || 'usuario' };
      usuario.value = payload;
      token.value = respuesta?.token || null;
    }

    function cerrarSesion() {
      usuario.value = null;
      token.value = null;
    }

    return {
      token,
      usuario,
      estaAutenticado,
      nombreUsuario,
      guardarSesion,
      cerrarSesion,
    };
  },
  { persist: true }
);

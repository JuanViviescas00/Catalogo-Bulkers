import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import apiService from '@/services/api.service';

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref(localStorage.getItem('token') || null);
    const usuario = ref(JSON.parse(localStorage.getItem('user') || 'null'));
    const user = usuario;
    const rol = ref(localStorage.getItem('rol') || 'user');
    const cargando = ref(false);

    const estaAutenticado = computed(() => !!token.value);
    const esAdmin = computed(() => rol.value === 'admin' || usuario.value?.rol === 'admin');
    const nombreUsuario = computed(() => usuario.value?.nombre || usuario.value?.email || 'Usuario');
    const obtenerUsuario = computed(() => usuario.value);

    function setSession(data) {
      if (data.token) {
        token.value = data.token;
        localStorage.setItem('token', data.token);

        try {
          const payloadBase64 = data.token.split('.')[1];
          const decoded = JSON.parse(atob(payloadBase64));
          rol.value = decoded.rol || 'user';
          usuario.value = { id: decoded.sub, email: decoded.email || '', rol: rol.value };

          localStorage.setItem('rol', rol.value);
          localStorage.setItem('user', JSON.stringify(usuario.value));
        } catch (e) {
          console.error('Error al decodificar JWT payload', e);
        }
      }

      if (data.usuario || data.user) {
        usuario.value = data.usuario || data.user;
        rol.value = usuario.value?.rol || rol.value;
        localStorage.setItem('user', JSON.stringify(usuario.value));
        localStorage.setItem('rol', rol.value);
      }
    }

    function guardarSesion(respuesta) {
      setSession(respuesta);
    }

    async function login(credenciales) {
      cargando.value = true;
      try {
        const respuesta = await apiService.post('/auth/login', credenciales);
        const resData = respuesta?.data || respuesta;
        if (resData && resData.token) {
          setSession({ token: resData.token, user: resData.user || resData.usuario });
        }
        return resData;
      } finally {
        cargando.value = false;
      }
    }

    async function registrar(datosUsuario) {
      cargando.value = true;
      try {
        const respuesta = await apiService.post('/auth/register', datosUsuario);
        const resData = respuesta?.data || respuesta;
        return resData;
      } finally {
        cargando.value = false;
      }
    }

    function cerrarSesion() {
      usuario.value = null;
      token.value = null;
      rol.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('rol');
    }

    function logout() {
      cerrarSesion();
    }

    function clearSession() {
      cerrarSesion();
    }

    return {
      token,
      usuario,
      user,
      rol,
      cargando,
      estaAutenticado,
      esAdmin,
      nombreUsuario,
      obtenerUsuario,
      setSession,
      guardarSesion,
      login,
      registrar,
      cerrarSesion,
      logout,
      clearSession,
    };
  },
  { persist: true }
);

export default useAuthStore;

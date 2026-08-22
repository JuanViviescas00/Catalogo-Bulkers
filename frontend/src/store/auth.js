import { defineStore } from 'pinia';
import apiService from '@/services/api.service';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    rol: localStorage.getItem('rol') || null,
    cargando: false,
  }),

  getters: {
    estaAutenticado: (state) => !!state.token,
    esAdmin: (state) => state.rol === 'admin',
    obtenerUsuario: (state) => state.user,
  },

  actions: {
    setSession(data) {
      if (data.token) {
        this.token = data.token;
        localStorage.setItem('token', data.token);

        try {
          const payloadBase64 = data.token.split('.')[1];
          const decoded = JSON.parse(atob(payloadBase64));
          this.rol = decoded.rol || 'user';
          this.user = { id: decoded.sub, email: decoded.email || '', rol: this.rol };

          localStorage.setItem('rol', this.rol);
          localStorage.setItem('user', JSON.stringify(this.user));
        } catch (e) {
          console.error('Error al decodificar JWT payload', e);
        }
      }

      if (data.id && data.email) {
        this.user = { id: data.id, email: data.email, rol: data.rol || this.rol };
        localStorage.setItem('user', JSON.stringify(this.user));
      }
    },

    async login(credenciales) {
      this.cargando = true;
      try {
        const respuesta = await apiService.post('/auth/login', credenciales);
        if (respuesta.data && respuesta.data.token) {
          this.setSession({ token: respuesta.data.token });
        }
        return respuesta.data;
      } finally {
        this.cargando = false;
      }
    },

    async registrar(datosUsuario) {
      this.cargando = true;
      try {
        const respuesta = await apiService.post('/auth/register', datosUsuario);
        return respuesta.data;
      } finally {
        this.cargando = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      this.rol = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('rol');
    },
  },

  persist: true,
});

export default useAuthStore;

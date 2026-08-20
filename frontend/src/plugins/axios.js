import axios from 'axios';
import { router } from '@/router';
import { useAuthStore } from '@/store/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const auth = useAuthStore();

  if (auth.token) {
    config.headers['Authorization'] = `Bearer ${auth.token}`;
  }

  return config;
});

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const data = error.response?.data;

    const errorNormalizado = {
      status: error.response?.status ?? 0,
      mensaje: data?.error?.mensaje || data?.message || data?.msg || mensajeSegunFallo(error),
      errores: Array.isArray(data?.errors) ? data.errors : [],
    };

    if (errorNormalizado.status === 401) {
      cerrarSesionYSalir();
    }

    return Promise.reject(errorNormalizado);
  }
);

function cerrarSesionYSalir() {
  const auth = useAuthStore();
  auth.logout();

  if (router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login' });
  }
}

function mensajeSegunFallo(error) {
  if (error.code === 'ECONNABORTED') {
    return 'El servidor tardó demasiado en responder';
  }
  if (!error.response) {
    return 'No hay conexión con el servidor. Verifica que el Backend esté corriendo en el puerto 3000.';
  }
  return 'Ocurrió un error inesperado';
}

export default api;

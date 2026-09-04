import axios from 'axios';
import { router } from '@/router';
import { useAuthStore } from '@/store/Auth';

const determinarBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // Fallback dinámico solo para red local en desarrollo (localhost o IP de red local)
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || /^192\.168\./.test(host) || /^10\./.test(host)) {
      return `http://${host}:3000/api`;
    }
  }

  return 'http://localhost:3000/api';
};

const api = axios.create({
  baseURL: determinarBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const auth = useAuthStore();

  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const mensajeBase =
      data?.message ||
      data?.msg ||
      data?.error?.mensaje ||
      data?.error?.message ||
      (typeof data?.error === 'string' ? data.error : '') ||
      'Ocurrió un error inesperado de red o conexión al servidor';

    const normalized = {
      status: error.response?.status ?? 0,
      mensaje: mensajeBase,
      errores: Array.isArray(data?.errors)
        ? data.errors
        : Array.isArray(data?.error?.errors)
          ? data.error.errors
          : [],
    };

    const currentRoute = router.currentRoute.value;

    if (normalized.status === 401) {
      const auth = useAuthStore();
      auth.cerrarSesion();

      if (currentRoute.name !== 'catalogo' && currentRoute.name !== 'login') {
        router.push({ name: 'login' });
      }
    }

    return Promise.reject(normalized);
  }
);

export default api;

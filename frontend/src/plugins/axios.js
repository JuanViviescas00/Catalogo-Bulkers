import axios from 'axios';
import { router } from '@/router';
import { useAuthStore } from '@/store/Auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

const rutasPublicas = ['/productos', '/categorias', '/proveedores'];

api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  const url = String(config.url || '');
  const esRutaPublica = rutasPublicas.some((ruta) => url.includes(ruta));

  if (auth.token && !esRutaPublica) {
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
      'Ocurrió un error inesperado';

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
    const esRutaPublica = currentRoute.name === 'catalogo' || currentRoute.path === '/';
    const esPeticionPublica = typeof error.config?.url === 'string' && rutasPublicas.some((ruta) => error.config.url.includes(ruta));

    if (normalized.status === 401) {
      const auth = useAuthStore();
      auth.cerrarSesion();

      if (!esRutaPublica && !esPeticionPublica && currentRoute.name !== 'login') {
        router.push({ name: 'login' });
      }
    }

    return Promise.reject(normalized);
  }
);

export default api;

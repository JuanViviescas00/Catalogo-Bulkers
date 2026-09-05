import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { determinarBaseURL } from '@/plugins/axios';

export const useGeneralStore = defineStore('general', () => {
  const titulo = ref(import.meta.env.VITE_APP_TITULO || 'Catalogo Bulkers');
  const menuAbierto = ref(false);
  const ultimaSincronizacion = ref(null);

  const urlApi = computed(() => determinarBaseURL());

  function alternarMenu() {
    menuAbierto.value = !menuAbierto.value;
  }

  function marcarSincronizacion() {
    ultimaSincronizacion.value = new Date();
  }

  return {
    titulo,
    menuAbierto,
    ultimaSincronizacion,
    urlApi,
    alternarMenu,
    marcarSincronizacion,
  };
});

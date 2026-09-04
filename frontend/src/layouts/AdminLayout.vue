<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/Auth';
import { useGeneralStore } from '@/store/General';
import logo from '@/assets/logo.svg';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const general = useGeneralStore();

const todasLasOpciones = [
  { name: 'catalogo', titulo: 'Catálogo', icono: 'storefront', soloAdmin: false },
  { name: 'importacion', titulo: 'Importación Masiva', icono: 'cloud_upload', soloAdmin: true },
  { name: 'proveedores', titulo: 'Proveedores', icono: 'local_shipping', soloAdmin: true },
  { name: 'categorias', titulo: 'Categorías', icono: 'category', soloAdmin: true },
  { name: 'productos', titulo: 'Productos', icono: 'inventory_2', soloAdmin: true },
  { name: 'usuarios', titulo: 'Usuarios', icono: 'people', soloAdmin: true },
];

const opcionesMenu = computed(() => {
  const esAdministrador = auth.rol === 'admin' || auth.usuario?.rol === 'admin';
  if (esAdministrador) {
    return todasLasOpciones;
  }
  return todasLasOpciones.filter((op) => !op.soloAdmin);
});

const tituloSeccion = computed(() => route.meta?.titulo || 'Catálogo');

const salir = () => {
  try {
    if (typeof auth.clearSession === 'function') {
      auth.clearSession();
    }
  } catch (e) {
    console.error(e);
  } finally {
    localStorage.clear();
    sessionStorage.clear();
    // Redirige directamente al catálogo público en lugar del login
    window.location.hash = '#/';
    window.location.reload();
  }
};
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="admin-layout">
    <q-header elevated class="admin-header text-white">
      <q-toolbar class="admin-toolbar" style="z-index: 10000; position: relative;">
        <q-btn
          v-if="auth.estaAutenticado"
          flat
          dense
          round
          icon="menu"
          aria-label="Abrir menu"
          @click="general.alternarMenu()"
          class="admin-menu-btn"
        />
        <q-toolbar-title class="text-weight-bold text-subtitle1">{{ tituloSeccion }}</q-toolbar-title>

        <template v-if="auth.estaAutenticado">
          <div class="row items-center q-gutter-x-sm">
            <q-badge
              :color="auth.esAdmin ? 'amber-9' : 'teal-8'"
              class="text-weight-bolder q-px-sm q-py-xs shadow-1 text-white"
              style="font-size: 11px; letter-spacing: 0.5px; border-radius: 6px;"
            >
              <q-icon :name="auth.esAdmin ? 'shield' : 'person'" size="14px" class="q-mr-xs" />
              {{ auth.esAdmin ? 'ADMIN' : 'USUARIO' }}
            </q-badge>

            <span v-if="auth.nombreUsuario && auth.nombreUsuario !== 'Admin' && auth.nombreUsuario !== 'Usuario'" class="text-caption gt-xs admin-user q-mr-xs">
              {{ auth.nombreUsuario }}
            </span>

            <q-btn
              flat
              dense
              round
              icon="logout"
              size="md"
              class="text-white"
              style="z-index: 10001; cursor: pointer;"
              @click="salir"
            >
              <q-tooltip>Cerrar sesión</q-tooltip>
            </q-btn>
          </div>
        </template>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="auth.estaAutenticado"
      v-model="general.menuAbierto"
      show-if-above
      bordered
      :width="248"
      class="admin-drawer"
    >
      <div class="admin-drawer__brand">
        <img :src="logo" alt="Logo" width="34" height="34" class="q-mr-sm" />
        <div class="text-weight-bold">{{ general.titulo }}</div>
      </div>

      <q-separator />

      <q-list padding>
        <q-item-label header class="text-uppercase text-caption text-weight-bold admin-menu-label">Menú</q-item-label>

        <q-item
          v-for="opcion in opcionesMenu"
          :key="opcion.name"
          v-ripple
          clickable
          class="enlace-menu admin-menu-item"
          :to="{ name: opcion.name }"
        >
          <q-item-section avatar>
            <q-icon :name="opcion.icono" />
          </q-item-section>
          <q-item-section>{{ opcion.titulo }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view :key="route.fullPath" />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.admin-layout {
  background: linear-gradient(180deg, #edf5ef 0%, #eef2ee 100%);
}

.admin-header {
  background: linear-gradient(90deg, #143d31 0%, #0d271f 100%) !important;
  box-shadow: 0 14px 24px rgba(18, 38, 31, 0.18) !important;
  color: white !important;
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
}

.admin-toolbar {
  min-height: 74px;
}

.admin-menu-btn,
.admin-action-btn {
  color: rgba(255, 255, 255, 0.9) !important;
}

.admin-user {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  letter-spacing: 0.03em;
}

.admin-drawer {
  background: linear-gradient(180deg, #f4faf5 0%, #edf4ef 100%) !important;
  border-right: 1px solid rgba(22, 57, 49, 0.08) !important;
  border-radius: 0 20px 20px 0;
}

.admin-drawer__brand {
  display: flex;
  align-items: center;
  padding: 22px 18px 18px;
  font-size: 1rem;
  color: #1d2a2c;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 0 20px 0 0;
}

.admin-menu-label {
  color: #586b6c;
  letter-spacing: 0.12em;
  padding-left: 18px;
}

.admin-menu-item {
  margin: 4px 10px;
  border-radius: 14px;
  color: #1f2b2d;
  transition: all 0.2s ease;
}

.admin-menu-item .q-item__section--avatar {
  min-width: 34px;
}

.enlace-menu.router-link-active,
.admin-menu-item.router-link-active,
.admin-menu-item.q-item--active {
  background: linear-gradient(90deg, #dfeee3 0%, #cfe6d5 100%) !important;
  color: #173d30 !important;
  font-weight: 700;
  box-shadow: inset 0 0 0 1px rgba(42, 127, 91, 0.08);
  border-radius: 14px;
}

.q-item--clickable:hover {
  background: rgba(200, 217, 210, 0.45);
}

:deep(.q-btn--standard.q-btn--actionable) {
  color: #ffffff;
}
</style>

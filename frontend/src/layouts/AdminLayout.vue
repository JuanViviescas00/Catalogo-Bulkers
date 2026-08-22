<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="row items-center q-gutter-x-sm cursor-pointer" @click="irAHome">
          <q-icon name="shopping_bag" size="28px" />
          <span class="text-weight-bold">CatálogoBulk</span>
        </q-toolbar-title>

        <q-space />

        <!-- SESIÓN INICIADA -->
        <div v-if="auth.estaAutenticado" class="row items-center q-gutter-x-md">
          <q-chip color="secondary" text-color="white" icon="account_circle">
            {{ auth.user?.email }} ({{ auth.rol }})
          </q-chip>

          <q-btn flat round icon="logout" @click="cerrarSesion">
            <q-tooltip>Cerrar Sesión</q-tooltip>
          </q-btn>
        </div>

        <!-- VISITANTE NO AUTENTICADO -->
        <div v-else class="row items-center">
          <q-btn
            label="Iniciar Sesión"
            icon="login"
            color="white"
            text-color="primary"
            class="text-weight-bold"
            to="/login"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-scroll-area class="fit">
        <q-list padding class="menu-list">
          <q-item-label header class="text-weight-bold text-uppercase text-grey-8">
            Navegación
          </q-item-label>

          <!-- VISTAS PÚBLICAS -->
          <q-item clickable v-ripple to="/" exact active-class="bg-blue-1 text-primary text-weight-bold">
            <q-item-section avatar>
              <q-icon name="storefront" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Catálogo E-Commerce</q-item-label>
            </q-item-section>
          </q-item>

          <!-- <q-item clickable v-ripple to="/acerca" active-class="bg-blue-1 text-primary text-weight-bold">
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Acerca de / Docs</q-item-label>
            </q-item-section>
          </q-item> -->

          <!-- VISTAS DE ADMINISTRACIÓN (SOLO AUTENTICADOS) -->
          <template v-if="auth.estaAutenticado">
            <q-separator class="q-my-md" />
            <q-item-label header class="text-weight-bold text-uppercase text-grey-8">
              Administración
            </q-item-label>

            <q-item clickable v-ripple to="/productos" active-class="bg-blue-1 text-primary text-weight-bold">
              <q-item-section avatar>
                <q-icon name="inventory_2" />
              </q-item-section>
              <q-item-section>
                <q-item-label>CRUD Productos</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/proveedores" active-class="bg-blue-1 text-primary text-weight-bold">
              <q-item-section avatar>
                <q-icon name="business" />
              </q-item-section>
              <q-item-section>
                <q-item-label>CRUD Proveedores</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/categorias" active-class="bg-blue-1 text-primary text-weight-bold">
              <q-item-section avatar>
                <q-icon name="category" />
              </q-item-section>
              <q-item-section>
                <q-item-label>CRUD Categorías</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/usuarios" active-class="bg-blue-1 text-primary text-weight-bold">
              <q-item-section avatar>
                <q-icon name="people" />
              </q-item-section>
              <q-item-section>
                <q-item-label>CRUD Usuarios</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/imports" active-class="bg-blue-1 text-primary text-weight-bold">
              <q-item-section avatar>
                <q-icon name="cloud_upload" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Importación Masiva</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <template v-else>
            <q-separator class="q-my-md" />
            <!-- <q-item clickable v-ripple to="/login" class="text-primary text-weight-bold">
              <q-item-section avatar>
                <q-icon name="lock" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Iniciar Sesión (Admin)</q-item-label>
              </q-item-section>
            </q-item> -->
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const auth = useAuthStore();
const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function irAHome() {
  router.push('/');
}

function cerrarSesion() {
  auth.logout();
  router.push('/');
}
</script>

<style scoped>
.menu-list .q-item {
  border-radius: 0 24px 24px 0;
  margin-right: 12px;
}
</style>

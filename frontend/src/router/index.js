import { createRouter, createWebHashHistory } from 'vue-router';
import { Notify } from 'quasar';
import { useAuthStore } from '@/store/auth';

import AdminLayout from '@/layouts/AdminLayout.vue';

import LoginView from '@/views/LoginView.vue';
import CatalogoView from '@/views/CatalogoView.vue';
import ProductosView from '@/views/ProductosView.vue';
import ProveedoresView from '@/views/ProveedoresView.vue';
import CategoriasView from '@/views/CategoriasView.vue';
import UsuariosView from '@/views/UsuariosView.vue';
import ImportsView from '@/views/ImportsView.vue';
import AboutView from '@/views/AboutView.vue';
import NotFoundView from '@/views/NotFoundView.vue';

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView,
    meta: { titulo: 'Iniciar Sesión', soloInvitados: true },
  },
  {
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: 'catalogo',
        name: 'catalogo',
        component: CatalogoView,
        meta: { titulo: 'Catálogo de Productos', requiereAuth: true },
      },
      {
        path: 'productos',
        name: 'productos',
        component: ProductosView,
        meta: { titulo: 'CRUD Productos', requiereAuth: true },
      },
      {
        path: 'proveedores',
        name: 'proveedores',
        component: ProveedoresView,
        meta: { titulo: 'CRUD Proveedores', requiereAuth: true },
      },
      {
        path: 'categorias',
        name: 'categorias',
        component: CategoriasView,
        meta: { titulo: 'CRUD Categorías', requiereAuth: true },
      },
      {
        path: 'usuarios',
        name: 'usuarios',
        component: UsuariosView,
        meta: { titulo: 'CRUD Usuarios', requiereAuth: true },
      },
      {
        path: 'imports',
        name: 'imports',
        component: ImportsView,
        meta: { titulo: 'Importación Masiva', requiereAuth: true },
      },
      {
        path: 'acerca',
        name: 'acerca',
        component: AboutView,
        meta: { titulo: 'Documentación' },
      },
      {
        path: ':pathMatch(.*)*',
        name: 'no-encontrado',
        component: NotFoundView,
        meta: { titulo: 'Página no encontrada' },
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

function protegerRutas(to) {
  const auth = useAuthStore();

  if (to.meta.requiereAuth === true && !auth.estaAutenticado) {
    Notify.create({
      type: 'negative',
      message: 'Debes iniciar sesión para acceder a esta vista',
      icon: 'lock',
      position: 'top-right',
    });
    return { name: 'login' };
  }

  if (to.meta.soloInvitados === true && auth.estaAutenticado) {
    return { name: 'catalogo' };
  }

  return true;
}

router.beforeEach(protegerRutas);

router.afterEach((to) => {
  const base = import.meta.env.VITE_APP_TITULO || 'CatálogoBulk';
  document.title = to.meta.titulo ? `${to.meta.titulo} | ${base}` : base;
});

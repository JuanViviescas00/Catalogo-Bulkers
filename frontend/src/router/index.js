import { createRouter, createWebHashHistory } from 'vue-router';
import { Notify } from 'quasar';
import { useAuthStore } from '@/store/Auth';

import AdminLayout from '@/layouts/AdminLayout.vue';
import LoginView from '@/views/LoginView.vue';
import ProveedoresView from '@/views/ProveedoresView.vue';
import CategoriasView from '@/views/CategoriasView.vue';
import ProductosView from '@/views/ProductosView.vue';
import UsuariosView from '@/views/UsuariosView.vue';
import ImportacionView from '@/views/ImportacionView.vue';
import CatalogoView from '@/views/CatalogoView.vue';
import NotFoundView from '@/views/NotFoundView.vue';

const routes = [
  {
    path: '/',
    name: 'catalogo',
    alias: ['/catalogo'],
    component: CatalogoView,
    meta: { titulo: 'Catálogo' },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    alias: ['/admin/login'],
    meta: { titulo: 'Iniciar sesión', soloInvitados: true },
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: 'importacion', name: 'importacion', component: ImportacionView, meta: { titulo: 'Importación masiva', requiereAuth: true } },
      { path: 'proveedores', name: 'proveedores', component: ProveedoresView, meta: { titulo: 'Proveedores', requiereAuth: true } },
      { path: 'categorias', name: 'categorias', component: CategoriasView, meta: { titulo: 'Categorías', requiereAuth: true } },
      { path: 'productos', name: 'productos', component: ProductosView, meta: { titulo: 'Productos', requiereAuth: true } },
      { path: 'usuarios', name: 'usuarios', component: UsuariosView, meta: { titulo: 'Usuarios', requiereAuth: true } },
      { path: ':pathMatch(.*)*', name: 'no-encontrado', component: NotFoundView, meta: { titulo: 'Página no encontrada' } },
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

  if (to.name === 'catalogo' && auth.estaAutenticado) {
    return { name: 'proveedores' };
  }

  if (to.meta.requiereAuth === true && !auth.estaAutenticado) {
    Notify.create({ type: 'negative', message: 'Debes iniciar sesión para entrar a esa página', icon: 'lock', position: 'top-right' });
    return { name: 'login' };
  }

  if (to.meta.soloInvitados === true && auth.estaAutenticado) {
    return { name: 'proveedores' };
  }

  return true;
}

router.beforeEach(protegerRutas);

router.afterEach((to) => {
  const base = import.meta.env.VITE_APP_TITULO || 'Catalogo Bulkers';
  document.title = to.meta.titulo ? `${to.meta.titulo} | ${base}` : base;
});

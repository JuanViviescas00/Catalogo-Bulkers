<script setup>
import { computed, onMounted, ref } from 'vue';
import EncabezadoPagina from '@/components/Encabezados/EncabezadoPagina.vue';
import { get } from '@/services/api.service';
import { useGeneralStore } from '@/store/General';
import { useNotificar } from '@/composables/useNotificar';

const general = useGeneralStore();
const { notificarError } = useNotificar();

const productos = ref([]);
const categorias = ref([]);
const proveedores = ref([]);
const categoriaSeleccionada = ref(null);
const proveedorSeleccionado = ref(null);
const buscador = ref('');
const soloDisponibles = ref(false);
const cargando = ref(false);

const cargar = async () => {
  cargando.value = true;
  try {
    const [resProductos, resCategorias, resProveedores] = await Promise.all([
      get('/productos'),
      get('/categorias'),
      get('/proveedores'),
    ]);

    productos.value = resProductos.data || [];
    categorias.value = resCategorias || [];
    proveedores.value = resProveedores.data || [];
    general.marcarSincronizacion();
  } catch (e) {
    notificarError(e);
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);

const categoriasOptions = computed(() => categorias.value.map((c) => ({ label: c.nombre, value: c.slug })));
const proveedoresOptions = computed(() => proveedores.value.map((p) => ({ label: p.nombre, value: p._id })));

const productosFiltrados = computed(() => {
  return productos.value.filter((producto) => {
    const nombreCoincide = producto.nombre.toLowerCase().includes(buscador.value.toLowerCase());
    const categoriaCoincide = !categoriaSeleccionada.value || producto.categoria === categoriaSeleccionada.value;
    const proveedorCoincide = !proveedorSeleccionado.value || producto.proveedorId === proveedorSeleccionado.value;
    const disponibleCoincide = !soloDisponibles.value || !!producto.disponible;
    return nombreCoincide && categoriaCoincide && proveedorCoincide && disponibleCoincide;
  });
});
</script>

<template>
  <div class="contenedor-app q-pa-md">
    <div class="catalog-frame">
      <header class="catalog-header">
        <div class="catalog-header__left">
          <div class="catalog-header__crumbs">Catálogo de Productos</div>
        </div>

        <div class="catalog-header__actions" />
      </header>

      <div class="catalog-content">
        <aside class="catalog-sidebar">
          <div class="catalog-brand">
            <span class="catalog-brand__icon">▣</span>
            <span>CatalogoBulk</span>
          </div>

          <div class="catalog-sidebar__section">Navegación</div>

          <nav class="catalog-nav">
            <button type="button" class="catalog-nav__item active">
              <span>Catálogo</span>
            </button>
          </nav>
        </aside>

        <main class="catalog-main">
          <div class="catalog-main__head">
            <h1>Catálogo de Productos</h1>
            <span class="catalog-main__chips">{{ productosFiltrados.length }} disponibles</span>
          </div>

          <div class="catalog-body">
            <div class="catalog-filters section-box">
              <div class="section-box__title">Filtros</div>
              <div class="q-pa-md q-gutter-md">
                <q-input v-model="buscador" outlined dense clearable label="Buscar producto" prepend-icon="search" />

                <q-select
                  v-model="categoriaSeleccionada"
                  :options="categoriasOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  clearable
                  label="Categoría"
                />

                <q-select
                  v-model="proveedorSeleccionado"
                  :options="proveedoresOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  clearable
                  label="Proveedor"
                />

                <q-toggle v-model="soloDisponibles" label="Solo disponibles" />

                <q-btn class="catalog-clear-btn" no-caps outline color="primary" label="Limpiar filtros" />
              </div>
            </div>

            <div class="catalog-results">
              <div v-if="cargando" class="catalog-empty">
                <q-spinner color="primary" size="40px" />
              </div>

              <template v-else>
                <div v-if="productosFiltrados.length === 0" class="catalog-empty">
                  <div class="catalog-empty__icon">◔</div>
                  <h3>No se encontraron productos</h3>
                  <p>Prueba cambiando los filtros o buscando otro término.</p>
                </div>

                <div v-else class="card-grid">
                  <q-card v-for="producto in productosFiltrados" :key="producto._id" flat class="product-card">
                    <q-img :src="producto.imagenUrl || 'https://placehold.co/600x400?text=Producto'" class="product-image" />
                    <q-card-section class="product-card__body">
                      <div class="text-subtitle1 text-weight-bold product-card__name">{{ producto.nombre }}</div>
                      <div class="text-caption text-grey-7 product-card__category">{{ producto.categoria }}</div>
                      <div class="text-h6 text-primary q-mt-sm">${{ Number(producto.precio).toLocaleString() }}</div>
                      <div class="text-body2 q-mt-sm product-card__description">{{ producto.descripcion || 'Sin descripción' }}</div>
                    </q-card-section>
                    <q-card-actions align="between" class="product-card__footer">
                      <span class="text-caption">Stock: {{ producto.stock }}</span>
                      <q-badge :color="producto.disponible ? 'positive' : 'grey-6'" :label="producto.disponible ? 'Disponible' : 'No disponible'" />
                    </q-card-actions>
                  </q-card>
                </div>
              </template>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

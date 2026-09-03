<script setup>
import { computed, onMounted, ref, watch } from 'vue';
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

const elementosPorPagina = 20;
const paginaActual = ref(1);

const cargar = async () => {
  cargando.value = true;
  try {
    const [resProductos, resCategorias, resProveedores] = await Promise.all([
      get('/productos?limit=100'),
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

const limpiarFiltros = () => {
  buscador.value = '';
  categoriaSeleccionada.value = null;
  proveedorSeleccionado.value = null;
  soloDisponibles.value = false;
  paginaActual.value = 1;
};

const productosFiltrados = computed(() => {
  return productos.value.filter((producto) => {
    const nombreCoincide = producto.nombre.toLowerCase().includes(buscador.value.toLowerCase());
    const categoriaCoincide = !categoriaSeleccionada.value || producto.categoria === categoriaSeleccionada.value;
    const proveedorCoincide = !proveedorSeleccionado.value || producto.proveedorId === proveedorSeleccionado.value;
    const disponibleCoincide = !soloDisponibles.value || !!producto.disponible;
    return nombreCoincide && categoriaCoincide && proveedorCoincide && disponibleCoincide;
  });
});

const totalPaginas = computed(() => {
  return Math.ceil(productosFiltrados.value.length / elementosPorPagina) || 1;
});

const productosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * elementosPorPagina;
  return productosFiltrados.value.slice(inicio, inicio + elementosPorPagina);
});

watch([buscador, categoriaSeleccionada, proveedorSeleccionado, soloDisponibles], () => {
  paginaActual.value = 1;
});

watch(paginaActual, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>

<template>
  <q-page class="contenedor-app q-pa-md">
    <div class="catalog-frame">
      <header class="catalog-header">
        <div class="catalog-header__left">
          <div class="catalog-header__crumbs">Catálogo de Productos</div>
        </div>

        <div class="catalog-header__actions" />
      </header>

      <div class="catalog-content">
        <main class="catalog-main" style="width: 100%">
          <div class="catalog-main__head">
            <h1>Catálogo de Productos</h1>
            <span class="catalog-main__chips">
              Mostrando {{ productosPaginados.length }} de {{ productosFiltrados.length }} disponibles
            </span>
          </div>

          <div class="catalog-body">
            <div class="catalog-filters section-box">
              <div class="section-box__title">Filtros</div>
              <div class="catalog-filters__body">
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

                <q-btn
                  class="catalog-clear-btn"
                  no-caps
                  outline
                  color="primary"
                  label="Limpiar filtros"
                  @click="limpiarFiltros"
                />
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

                <div v-else>
                  <div class="card-grid">
                    <q-card v-for="producto in productosPaginados" :key="producto._id" flat class="product-card">
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

                  <!-- Paginador reactivo si hay más de 20 productos -->
                  <div v-if="totalPaginas > 1" class="row justify-center q-mt-xl q-mb-md">
                    <q-pagination
                      v-model="paginaActual"
                      :max="totalPaginas"
                      :max-pages="6"
                      direction-links
                      boundary-links
                      color="primary"
                      active-color="primary"
                      active-design="unelevated"
                      size="15px"
                      class="shadow-1 q-pa-xs bg-white"
                      style="border-radius: 12px;"
                    />
                  </div>
                </div>
              </template>
            </div>
          </div>
        </main>
      </div>
    </div>
  </q-page>
</template>

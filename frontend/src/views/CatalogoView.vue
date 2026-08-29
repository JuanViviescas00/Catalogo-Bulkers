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

const extraerLista = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.data)) return res.data.data;
  return [];
};

const cargar = async () => {
  cargando.value = true;
  try {
    const [resProd, resCat, resProv] = await Promise.allSettled([
      get('/productos'),
      get('/categorias'),
      get('/proveedores'),
    ]);

    if (resProd.status === 'fulfilled') productos.value = extraerLista(resProd.value);
    if (resCat.status === 'fulfilled') categorias.value = extraerLista(resCat.value);
    if (resProv.status === 'fulfilled') proveedores.value = extraerLista(resProv.value);
    general.marcarSincronizacion();
  } catch (e) {
    console.error(e);
  } finally {
    cargando.value = false;
  }
};

const limpiarFiltros = () => {
  buscador.value = '';
  categoriaSeleccionada.value = null;
  proveedorSeleccionado.value = null;
  soloDisponibles.value = false;
};

onMounted(cargar);

const categoriasOptions = computed(() => categorias.value.map((c) => ({ label: c.nombre, value: c.slug })));
const proveedoresOptions = computed(() => proveedores.value.map((p) => ({ label: p.nombre, value: p._id })));

const productosFiltrados = computed(() => {
  return productos.value.filter((producto) => {
    const nombreCoincide = producto.nombre ? producto.nombre.toLowerCase().includes(buscador.value.toLowerCase()) : false;
    const categoriaCoincide = !categoriaSeleccionada.value || producto.categoria === categoriaSeleccionada.value;
    const proveedorCoincide = !proveedorSeleccionado.value || producto.proveedorId === proveedorSeleccionado.value;
    const disponibleCoincide = !soloDisponibles.value || !!producto.disponible;
    return nombreCoincide && categoriaCoincide && proveedorCoincide && disponibleCoincide;
  });
});
</script>

<template>
  <div class="contenedor-app q-pa-lg">
    <div class="catalog-frame max-width-container">
      
      <!-- ENCABEZADO CON ESPACIADO -->
      <div class="catalog-main__head animated fadeInDown q-mb-xl row items-center justify-between">
        <div>
          <h1 class="text-h4 text-bold q-my-none text-primary">Catálogo de Productos</h1>
          <p class="text-subtitle2 text-grey-7 q-mb-none q-mt-xs">Explora nuestras herramientas y productos disponibles</p>
        </div>
        <q-chip color="positive" text-color="white" icon="inventory_2" class="text-weight-bold">
          {{ productosFiltrados.length }} Disponibles
        </q-chip>
      </div>

      <div class="row q-col-gutter-lg">
        
        <!-- COLUMNA IZQUIERDA: FILTROS CON MARGEN INTERNO Y SOMBRA -->
        <div class="col-12 col-md-3">
          <q-card flat bordered class="catalog-filters section-box animated slideInLeft q-pa-md shadow-1">
            <div class="section-box__title text-subtitle1 text-bold q-mb-md text-grey-9 row items-center">
              <q-icon name="filter_list" class="q-mr-sm" size="sm" />
              Filtros
            </div>

            <div class="q-gutter-y-md">
              <q-input 
                v-model="buscador" 
                outlined 
                dense 
                clearable 
                label="Buscar producto" 
                prepend-icon="search" 
              />

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

              <q-separator class="q-my-sm" />

              <q-toggle v-model="soloDisponibles" label="Solo disponibles" />

              <q-btn 
                class="catalog-clear-btn full-width q-mt-md" 
                no-caps 
                outline 
                color="primary" 
                label="Limpiar filtros" 
                @click="limpiarFiltros" 
              />
            </div>
          </q-card>
        </div>

        <!-- COLUMNA DERECHA: RESULTADOS -->
        <div class="col-12 col-md-9">
          <div class="catalog-results">
            
            <!-- SKELETON LOADERS -->
            <div v-if="cargando" class="row q-col-gutter-md animated fadeIn">
              <div v-for="n in 6" :key="n" class="col-12 col-sm-6 col-md-4">
                <q-card flat bordered class="q-pa-sm">
                  <q-skeleton height="180px" square animation="wave" />
                  <q-card-section class="q-gutter-xs q-pt-md">
                    <q-skeleton type="text" class="text-subtitle1" animation="wave" />
                    <q-skeleton type="text" width="60%" animation="wave" />
                    <q-skeleton type="text" class="text-h6" width="40%" animation="wave" />
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <template v-else>
              <!-- ESTADO VACÍO -->
              <div v-if="productosFiltrados.length === 0" class="catalog-empty animated zoomIn q-pa-xl text-center bg-grey-2 rounded-borders">
                <q-icon name="search_off" size="4rem" color="grey-6" class="q-mb-sm" />
                <h3 class="text-h6 text-grey-8 q-my-none">No se encontraron productos</h3>
                <p class="text-caption text-grey-7 q-mt-xs">Prueba cambiando los filtros o buscando otro término.</p>
              </div>

              <!-- TARJETAS DE PRODUCTOS EN REJILLA ESPACIADA -->
              <transition-group
                v-else
                tag="div"
                class="row q-col-gutter-md"
                enter-active-class="animated fadeInUp"
                leave-active-class="animated fadeOut"
              >
                <div
                  v-for="(producto, index) in productosFiltrados"
                  :key="producto._id"
                  class="col-12 col-sm-6 col-md-4 q-mb-sm"
                >
                  <q-card
                    flat
                    bordered
                    class="product-card full-height column justify-between shadow-1 hover-shadow"
                    :style="{ animationDelay: `${(index % 12) * 0.05}s` }"
                  >
                    <div>
                      <q-img 
                        :src="producto.imagenUrl || 'https://placehold.co/600x400?text=Producto'" 
                        class="product-image" 
                        height="180px"
                      />
                      <q-card-section class="product-card__body q-pa-md">
                        <div class="text-subtitle1 text-weight-bold product-card__name text-grey-9">{{ producto.nombre }}</div>
                        <div class="text-caption text-grey-7 product-card__category q-mb-xs">{{ producto.categoria }}</div>
                        <div class="text-h6 text-primary text-bold q-my-xs">${{ Number(producto.precio).toLocaleString() }}</div>
                        <div class="text-body2 text-grey-8 product-card__description q-mt-xs">{{ producto.descripcion || 'Sin descripción' }}</div>
                      </q-card-section>
                    </div>

                    <div>
                      <q-separator />
                      <q-card-actions align="between" class="product-card__footer q-px-md q-py-sm">
                        <span class="text-caption text-grey-7">Stock: <b>{{ producto.stock }}</b></span>
                        <q-badge :color="producto.disponible ? 'positive' : 'grey-6'" :label="producto.disponible ? 'Disponible' : 'No disponible'" />
                      </q-card-actions>
                    </div>
                  </q-card>
                </div>
              </transition-group>
            </template>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

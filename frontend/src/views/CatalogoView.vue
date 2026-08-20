<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="row q-col-gutter-md">
      <!-- PANEL LATERAL DE FILTROS -->
      <div class="col-12 col-md-3">
        <q-card flat bordered class="shadow-1">
          <q-card-section class="bg-primary text-white row items-center">
            <q-icon name="filter_alt" size="24px" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">Filtros</div>
          </q-card-section>

          <q-card-section class="q-gutter-y-md">
            <!-- Buscar por Nombre -->
            <div>
              <div class="text-subtitle2 text-grey-8 q-mb-xs">Buscar Producto</div>
              <q-input
                v-model="filtroNombre"
                placeholder="Nombre o palabra clave..."
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <!-- Filtro por Categoría -->
            <div>
              <div class="text-subtitle2 text-grey-8 q-mb-xs">Categoría</div>
              <q-select
                v-model="filtroCategoria"
                :options="opcionesCategorias"
                option-label="nombre"
                option-value="slug"
                emit-value
                map-options
                outlined
                dense
                clearable
                placeholder="Todas las categorías"
                @update:model-value="cargarProductos"
              />
            </div>

            <!-- Filtro por Proveedor -->
            <div>
              <div class="text-subtitle2 text-grey-8 q-mb-xs">Proveedor</div>
              <q-select
                v-model="filtroProveedor"
                :options="opcionesProveedores"
                option-label="nombre"
                option-value="slug"
                emit-value
                map-options
                outlined
                dense
                clearable
                placeholder="Todos los proveedores"
                @update:model-value="cargarProductos"
              />
            </div>

            <!-- Filtro por Disponibilidad -->
            <div class="row items-center justify-between">
              <span class="text-subtitle2 text-grey-8">Solo Disponibles</span>
              <q-toggle
                v-model="filtroDisponible"
                color="positive"
                @update:model-value="cargarProductos"
              />
            </div>

            <q-separator />

            <q-btn
              label="Limpiar Filtros"
              icon="cleaning_services"
              outline
              color="primary"
              class="full-width"
              @click="limpiarFiltros"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- GRID DE PRODUCTOS E-COMMERCE -->
      <div class="col-12 col-md-9">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h5 text-weight-bold text-primary">
            Catálogo de Productos
            <q-badge color="primary" class="q-ml-sm" style="font-size: 14px">
              {{ productosFiltrados.length }} disponibles
            </q-badge>
          </div>
        </div>

        <!-- Spinner de Carga -->
        <div v-if="cargando" class="row justify-center q-my-xl">
          <q-spinner-dots color="primary" size="50px" />
        </div>

        <!-- Sin Productos -->
        <div v-else-if="productosFiltrados.length === 0" class="text-center q-pa-xl bg-white shadow-1 rounded-borders">
          <q-icon name="sentiment_dissatisfied" size="64px" color="grey-6" />
          <div class="text-h6 text-grey-8 q-mt-sm">No se encontraron productos</div>
          <div class="text-caption text-grey-6">Prueba cambiando los criterios de filtro o la búsqueda.</div>
        </div>

        <!-- GRID TARJETAS -->
        <div v-else class="row q-col-gutter-md">
          <div
            v-for="producto in productosFiltrados"
            :key="producto._id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card flat bordered class="product-card full-height column justify-between shadow-2">
              <div>
                <!-- Imagen del Producto -->
                <q-img
                  :src="producto.imagenUrl || placeholderImg"
                  height="180px"
                  fit="cover"
                  class="bg-grey-3"
                >
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-grey-3 text-grey-7">
                      <q-icon name="image_not_supported" size="48px" />
                    </div>
                  </template>
                  <div class="absolute-top-right bg-transparent q-pa-xs">
                    <q-badge :color="producto.disponible ? 'positive' : 'negative'">
                      {{ producto.disponible ? 'En Stock' : 'Agotado' }}
                    </q-badge>
                  </div>
                </q-img>

                <q-card-section>
                  <div class="row items-center justify-between q-mb-xs">
                    <q-badge outline color="primary" class="text-uppercase">
                      SKU: {{ producto.sku }}
                    </q-badge>
                    <q-badge color="grey-8">
                      {{ producto.categoria }}
                    </q-badge>
                  </div>

                  <div class="text-subtitle1 text-weight-bold ellipsis-2-lines q-mt-xs">
                    {{ producto.nombre }}
                  </div>

                  <div class="text-caption text-grey-7 ellipsis-2-lines q-mt-xs">
                    {{ producto.descripcion || 'Sin descripción disponible.' }}
                  </div>
                </q-card-section>
              </div>

              <div>
                <q-separator />
                <q-card-section class="row items-center justify-between bg-grey-1">
                  <div>
                    <div class="text-caption text-grey-6">Precio</div>
                    <div class="text-h6 text-weight-bold text-green-8">
                      ${{ producto.precio.toFixed(2) }}
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-caption text-grey-6">Stock</div>
                    <div class="text-subtitle2 text-weight-bold">
                      {{ producto.stock }} unidades
                    </div>
                  </div>
                </q-card-section>
              </div>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import apiService from '@/services/api.service';

const cargando = ref(false);
const productos = ref([]);
const opcionesCategorias = ref([]);
const opcionesProveedores = ref([]);

const filtroNombre = ref('');
const filtroCategoria = ref(null);
const filtroProveedor = ref(null);
const filtroDisponible = ref(false);

const placeholderImg = 'https://via.placeholder.com/300x200?text=Cat%C3%A1logoBulk';

const productosFiltrados = computed(() => {
  if (!filtroNombre.value) return productos.value;
  const query = filtroNombre.value.toLowerCase();
  return productos.value.filter(
    (p) =>
      p.nombre.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query)
  );
});

async function cargarProductos() {
  cargando.value = true;
  try {
    const params = {};
    if (filtroCategoria.value) params.categoria = filtroCategoria.value;
    if (filtroProveedor.value) params.proveedor = filtroProveedor.value;
    if (filtroDisponible.value) params.disponible = 'true';

    const res = await apiService.get('/productos', params);
    productos.value = res.data?.data || [];
  } catch (e) {
    console.error('Error al cargar productos', e);
  } finally {
    cargando.value = false;
  }
}

async function cargarFiltros() {
  try {
    const [resCat, resProv] = await Promise.all([
      apiService.get('/categorias'),
      apiService.get('/proveedores'),
    ]);
    opcionesCategorias.value = resCat.data || [];
    opcionesProveedores.value = resProv.data?.data || [];
  } catch (e) {
    console.error('Error al cargar opciones de filtros', e);
  }
}

function limpiarFiltros() {
  filtroNombre.value = '';
  filtroCategoria.value = null;
  filtroProveedor.value = null;
  filtroDisponible.value = false;
  cargarProductos();
}

onMounted(() => {
  cargarFiltros();
  cargarProductos();
});
</script>

<style scoped>
.product-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 8px;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12) !important;
}
</style>


import { toast } from "wc-toast";
import { apiBaseUrl, Producto } from "../../util";

/**
 * 
 * @param {string} arg 
 * @returns {Element}
 */
const $ = (arg) => document.querySelector(arg);
const form = $('#form_search');

/**
 * @type {Producto[]}
 */
let productos = []


/**
 * 
 * @param {Producto[]} productos 
 * @returns 
 */
const createProductos = (productos) => {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
      ${productos
        .map(
          (p) => `
          <a href="${window.location.href}producto/?producto=${p.id_producto}"> 
          <div class="w-50 h-70 border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-(--clr-surface-a10) dark:bg-(--clr-surface-a10) hover:scale-[1.05]">
            <img 
              src="${p.img_url}" 
              alt="${p.nombre}" 
              class="w-full h-22 object-cover"
            />

            <div class="p-4 flex flex-col items-start align-middle gap-2 text-white">
              <h3 class="font-semibold">${p.nombre}</h3>
              <div class="flex flex-row justify-center items-start">
                  <h4 class="">
                    <span class="font-bold" > Precio: </span>
                    <span class="text-md">$${p.precio}</span>
                  </h4>
              </div>
              <div class="flex justify-between items-center mt-3">
                <span class="text-xs px-2 py-1 bg-amber-600 rounded-md">
                  ${p.categoria_nombre}
                </span>
              </div>
            </div>
          </div>
        </a>
        `
        )
        .join("")}
    </div>
  `;
};

const renderProductos = (html) => {
  const lista = $('#lista_productos');
  lista.innerHTML = html;
};

const poblarCategorias = () => {
  const select = $('#filtro_categoria');
  const setCats = new Map();
  productos.forEach(p => {
    if (!setCats.has(p.categoria_id)) setCats.set(p.categoria_id, p.categoria_nombre);
  });
  select.innerHTML = `<option value="">Todas</option>` + Array.from(setCats.entries()).map(([id, nombre]) => `<option value="${id}">${nombre}</option>`).join('');
};

const ajustarRangoPrecio = () => {
  const maxPrecio = productos.reduce((acc, p) => Math.max(acc, Number(p.precio || 0)), 0);
  const rango = $('#filtro_precio');
  const precioValue = $('#precio_value');
  const ceilMax = Math.max(50, Math.ceil(maxPrecio / 50) * 50);
  rango.max = ceilMax;
  rango.value = ceilMax;
  precioValue.textContent = ceilMax;
};

const aplicarFiltros = () => {
  const categoria = $('#filtro_categoria').value;
  const precioMax = Number($('#filtro_precio').value);
  const query = ($('#search').value || '').trim().toLowerCase();
  const filtrados = productos.filter(p => {
    const matchesCategory = categoria === '' || String(p.categoria_id) === String(categoria);
    const matchesPrice = Number(p.precio) <= precioMax;
    const matchesQuery = query === '' || p.nombre.toLowerCase().includes(query) || (p.categoria_nombre || '').toLowerCase().includes(query);
    return matchesCategory && matchesPrice && matchesQuery;
  });
  const html = createProductos(filtrados);
  renderProductos(html);
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  let query = formData.get('query_search') || '';
  try {
    const resp = await fetch(`${apiBaseUrl}/productos/search?q=${query}`);
    const data = await resp.json();
    productos = data;
    poblarCategorias();
    ajustarRangoPrecio();
    aplicarFiltros();
  } catch {
    toast.error('Fallo al buscar los productos');
  }
});

$('#filtro_categoria').addEventListener('change', aplicarFiltros);
$('#filtro_precio').addEventListener('input', (e) => {
  $('#precio_value').textContent = e.target.value;
  aplicarFiltros();
});
$('#search').addEventListener('input', () => {
  aplicarFiltros();
});

async function loadProducts() {
  try {
    if (localStorage.getItem("login_status") !== "login-success") return;

    
    let params = new URLSearchParams(document.location.search);

    

    const layout = $('#layout_productos');
    if (layout) layout.classList.remove('hidden');
    const resp = await fetch(`${apiBaseUrl}/productos`);
    const data = await resp.json();
    if (!resp.ok) {
      toast.error("Fallo al conseguir los productos");
      return;
    }
    if (!data || data.length === 0) {
      toast.error("No se encontraron productos");
      return;
    }
    productos = data;
    poblarCategorias();
    ajustarRangoPrecio();
    const productosHtml = createProductos(productos);
    renderProductos(productosHtml);
  } catch (err) {
    toast.error("Fallo al conseguir los productos");
  }
}

window.onload = function() {
  loadProducts();
};

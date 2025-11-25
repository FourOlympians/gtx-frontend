
import { toast } from "wc-toast";

/**
 * 
 * @param {string} arg 
 * @returns {Element}
 */
const $ = (arg) => document.querySelector(arg);
const form = $('#form_search');
let productos = []

const createProductos = (productos) => {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
      ${productos
        .map(
          (p) => `
          <div class="w-60 h-50 border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white hover:scale-[1.1]">
            <img 
              src="${p.img_url}" 
              alt="${p.nombre}" 
              class="w-full h-30 object-cover"
            />

            <div class="p-4 flex flex-col gap-2 text-black">
              <h3 class="text-lg font-semibold">${p.nombre}</h3>
              <p class="text-sm text-gray-600">${p.descripcion}</p>

              <div class="flex justify-between items-center mt-3">
                <span class="text-xl font-bold">$${p.precio}</span>
                <span class="text-xs px-2 py-1 bg-gray-100 rounded-md">
                  ${p.categoria_nombre}
                </span>
              </div>
            </div>
          </div>
        `
        )
        .join("")}
    </div>
  `;
};


form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    let query = formData.get('query_search');

    //if (query === undefined || query === ""){
    //    toast.error('Ingresa una busqueda valida')
    //    return;
    //}

    try {
        const resp = await fetch(`${apiBaseUrl}/productos/search?q=${query}`)
        const data = await resp.json()

        productos = data;
        const html = createProductos(productos);
        renderProductos(html);
        
    } catch (error) {
        toast.error('Fallo al buscar los productos')
    }

});

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL 

function renderProductos(html) {

    const lista_productos = $('#lista_productos');

    lista_productos.innerHTML = html;
}

async function loadProducts() {
    try {
      
        if (localStorage.getItem("login_status") === "login-success") {
            const layout = $('#layout_productos')
            layout.classList.remove('hidden')
        }

        const resp = await fetch(`${apiBaseUrl}/productos`);
        const data = await resp.json();

        if (!resp.ok) {
            toast.error("Fallo al conseguir los productos")
            return
        }

        if (data === null || data.length === 0) {
            toast.error("No se encontraron productos")
            return
        } 

        productos = data;

        const productosHtml = createProductos(productos);
        renderProductos(productosHtml);


    } catch (error) {
        console.log(error)
        toast.error("Fallo al conseguir los productos")
        
    }
}


loadProducts();
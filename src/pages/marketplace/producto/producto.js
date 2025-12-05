import { apiBaseUrl, Producto } from '../../../util';
import { toast } from 'wc-toast';

let params = new URLSearchParams(document.location.search);
let id_producto = params.get("producto");
const layout = document.querySelector('#layout_producto')
const carritoBtn = document.querySelector('#carrito_btn')
const compraBtn = document.querySelector('#compra_btn')
const agregarUno = document.querySelector('#increment-button')
const quitarUno = document.querySelector('#decrement-button')
/**
 * @type {HTMLInputElement}
 */
const cantidad_productos = document.querySelector('#cantidad_productos')

/**
 * 
 * @type {Producto | null}  
 */
let producto = null
let cantidad = 1

agregarUno.addEventListener('click', () => {
    cantidad++;

    if (cantidad > producto.stock)
        cantidad--;

    cantidad_productos.value = cantidad
    //cantidad_productos.textContent = cantidad;
})

quitarUno.addEventListener('click', () => {
    cantidad--;

    if (cantidad < 1)
        cantidad++;


    cantidad_productos.value = cantidad
    //cantidad_productos.textContent = cantidad;
})

function loadHmtlProduct() {

    if (!producto) return;

    const nombre = document.querySelector('.producto_nombre')
    const descripcion = document.querySelector('.producto_descripcion')
    const precio = document.querySelector('.producto_precio')
    const stock = document.querySelector('.producto_stock')
    /**
     * @type {HTMLImageElement}
     */
    const imagen = document.querySelector('.producto_imagen')

    
    imagen.src = producto.img_url
    nombre.textContent = producto.nombre
    descripcion.textContent = producto.descripcion
    precio.textContent = "$ " + producto.precio
    stock.textContent = "Stock disponible: " + producto.stock
    cantidad_productos.max = producto.stock
}

async function ObtenerProducto(id_producto) {

    try {
        /**
         * @type {Producto | null}
         */

        const resp = await fetch(`${apiBaseUrl}/productos/${id_producto}`)

        if (!resp.ok) {
            return
        }

        producto = await resp.json() 
        loadHmtlProduct(producto)

        layout.classList.toggle('hidden')
        toast.success('Producto cargado con exito')

    } catch (error) {
        toast.error('Error al cargar el Producto')
        console.log(error)
    }

} 

ObtenerProducto(id_producto)

async function realizarVenta() {

    if (!producto) return;

    try {

        

        let headersList = {
         "Accept": "*/*",
         "Content-Type": "application/json"
        }
    
        let bodyContent = JSON.stringify({
          "id_usuario": 1,
          "total": producto.precio,
          "detalles": [
            {
              "id_producto": id_producto,
              "cantidad": cantidad,
              "precio_unitario": producto.precio
            }
          ],
          "metodo_pago": "transferencia"
        });
    
    
        let response = await fetch(`${apiBaseUrl}/ventas/`, { 
          method: "POST",
          body: bodyContent,
          headers: headersList
        });

        if (!response.ok) {
           toast.error('Fallo al realizar la venta')
           const data = await response.json()
           console.log(data)
           return; 
        }
        
        const data = await response.json()

        toast.success('Venta realizada con exito')


        toast.loading('Redirigiendo a Marketplace...')
        setTimeout(() => {
            window.location.href = '/pages/marketplace/'
        }, 3000);

    } catch (error) {
        toast.error('Fallo al realizar la venta')
        console.log(error)
    }    

}


compraBtn.addEventListener('click', () => {
    realizarVenta()
})


carritoBtn.addEventListener('click', () => {
    console.log('carrito!')
})


export const STATUS_LOGIN = {
    FAILED: 'failed',
    SUCCESS: 'sucess'
}

/**
 *  @type {string}
 */
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

/**
 * 
 * @param {string} name 
 * @returns {string}
 */
export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 1) return parts.pop().split(";").shift();
}

export class Producto {

    constructor({id_producto, categoria_id, categoria_nombre, img_url, nombre, precio, tipo, stock}) {

        this.id_producto = id_producto
        this.categoria_id = categoria_id
        this.categoria_nombre = categoria_nombre
        this.img_url = img_url
        this.nombre = nombre
        this.precio = precio
        this.tipo = tipo
        this.stock = stock
    }
}



export async function isLogin() {

    const response = await fetch(`${apiBaseUrl}/auth/verify/token`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie("csrf_access_token"),
            },
            credentials: 'include',

        }
    )

    if (!response.ok) {
        return  {
            status: STATUS_LOGIN.FAILED,
            data: null
        }
    }

    const data = await response.json();

    return {
        status: STATUS_LOGIN.SUCCESS,
        data
    }

}

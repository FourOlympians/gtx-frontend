import { toast } from 'wc-toast'
import { getCookie } from '../../util';
import './login.css'

const loginForm = document.getElementById('login-form');
/**
 * @type {HTMLButtonElement}
 */
const loginBtn = document.querySelector('#login_btn')
console.log(loginBtn)

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL 
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
        loginBtn.classList.add('is-loading')
        loginBtn.disabled = true
        loginBtn.textContent = "Validando usuario ..."

        const response = await fetch(`${apiBaseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie("csrf_access_token")
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        });

        if (!response.ok) {

            loginBtn.disabled = false
            loginBtn.classList.remove('is-loading')
            loginBtn.textContent = "Ingresar"


            if (response.status === 401) {
                toast.error('Credenciales invalidas. Por favor, intente de nuevo.');
                return;
            }

            throw new Error('Datos invalidos')
        }

        const data = await response.json();
        localStorage.setItem("login_status", "login-success");
        window.location.href = '/pages/marketplace/';

        loginBtn.disabled = false
        loginBtn.classList.remove('is-loading')
        loginBtn.textContent = "Ingresar"



    } catch (error) {
        loginBtn.disabled = false
        loginBtn.classList.remove('is-loading')
        loginBtn.textContent = "Ingresar"


        toast.error('Fallo al Iniciar Sesión ' + error.message)

        console.error('Error:', error);
    }
})
import { toast } from 'wc-toast'
import { getCookie } from '../../util';

const loginForm = document.getElementById('login-form');

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL 
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');

    console.log(email, password);
    try {
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

            if (response.status === 401) {
                toast.error('Credenciales invalidas. Por favor, intente de nuevo.');
                return;
            }

            throw new Error('Datos invalidos')
        }

        const data = await response.json();
        localStorage.setItem("login_status", "login-success");
        window.location.href = '/pages/marketplace/';
    } catch (error) {

        toast.error('Fallo al Iniciar Sesión ' + error.message)

        console.error('Error:', error);
    }
})
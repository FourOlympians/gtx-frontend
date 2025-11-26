
import { toast } from 'wc-toast';
const loginForm = document.getElementById('login-form');                

import { getCookie } from '../../util.js'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
console.log(apiBaseUrl)


loginForm.addEventListener('submit', async (e) => { 
    e.preventDefault();

    const formData = new FormData(loginForm);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');

    console.log(username, email, password);
    try {
        const response = await fetch(`${apiBaseUrl}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "X-CSRF-TOKEN": getCookie("csrf_access_token"),
            },
            body: JSON.stringify({ username, email, password }),
            credentials: 'include',
        });

        if (!response.ok) {

            if (response.status === 400) {
                toast.error('Datos invalidos. Por favor, verifique e intente de nuevo.');
                return;
            }

            if (response.status === 409) {
                toast.error('El correo electrónico ya está en uso. Por favor, use otro.');  
                return;
            }

            toast.error('Fallo al Registrar Usuario');  
            return;
        }

        const data = await response.json();
        localStorage.setItem("login_status", "login-success");
        window.location.href = '/pages/marketplace/';
    } catch (error) {
        console.error('Error:', error);
    }
})
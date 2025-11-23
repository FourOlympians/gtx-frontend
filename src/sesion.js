const sesion_section = document.getElementById('sesion_section');

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const default_content = `
 <a id="sesion_ancor" href="/pages/login/"
                    class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">

                    Iniciar Sesion
                </a>
                <button data-collapse-toggle="navbar-cta" type="button"
                    class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                    aria-controls="navbar-cta" aria-expanded="false">
                    <span class="sr-only">Open main menu</span>
                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 17 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M1 1h15M1 7h15M1 13h15" />
                    </svg>
                </button>
`;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}


const cerrar_sesion = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "X-CSRF-TOKEN": getCookie("csrf_access_token"),
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
        window.location.href = '/';
        sesion_section.innerHTML = default_content;
    } catch (error) {
        console.error('Error:', error);
    }
}

const cerrar_sesion_button = document.querySelector('#btn_cerrar');

cerrar_sesion_button?.addEventListener('click', async (e) => {
    e.preventDefault();
    await cerrar_sesion();
});

const checkSesion = async () => {

    const button = `
            <button data-collapse-toggle="navbar-cta" type="button"
                    class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                    aria-controls="navbar-cta" aria-expanded="false">
                    <span class="sr-only">Open main menu</span>
                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 17 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
        </button>
    `;


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

    if (response.ok) {
        const data = await response.json();
        const btn = document.querySelector('#btn_cerrar');
        const ancor = document.querySelector('#ancor_login');

        btn.classList.remove('hidden');
        ancor.classList.add('hidden');
        //sesion_section.innerHTML += button;
        const msg = document.querySelector(".msg")
        msg.textContent = "Bienvenido a nuestro menu de ventas!"

        console.log(data);
    } else {

        //sesion_section.innerHTML = default_content;

        const msg = document.querySelector(".msg")
        
        msg.textContent = "No has iniciado sesion. Favor de ingresar su cuenta"
    }

}


checkSesion();
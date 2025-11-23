

const nav_elem = document.querySelector('#nav_menu')

const links = [
    { 
        label: 'Marketplace',       
        href: '/pages/marketplace/'
    },
    {
        label: 'Sobre Nosotros',
        href: '#'
    }, 
    {    
        label: 'Services',  
        href: '#'
    }, 
    {
        label: 'Contact',
        href: '#'
    },  
    {   
        label: 'Ejercicios',
        href: '/pages/ejercicios/'
    }  
]


const nav_content = `
        <div class="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-4">
            <a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
                <img src="/gtx_logo.png" class="h-8" alt="Flowbite Logo" />
                <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">GTX</span>
            </a>
            <div id="sesion_section" class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                <button id="btn_cerrar"
                    class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 hidden">
                    Cerrar Sesion
                </button>
                <a id="ancor_login" href="/pages/login/"
                    class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">

                    Iniciar Sesion
                </a>
                <button data-collapse-toggle="navbar-cta" id="btn_menu" type="button"
                    class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                    aria-controls="navbar-cta" aria-expanded="false">
                    <span class="sr-only">Open main menu</span>
                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 17 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M1 1h15M1 7h15M1 13h15" />
                    </svg>
                </button>
            </div>
            <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-cta">
                <ul
                    class="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-(--clr-surface-a10) md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-(--clr-surface-a10) md:dark:bg-[clr-surface-a10]-900 dark:border-gray-700">
                    ${
                        links.map(link => `   
                        <li>
                            <a href="${link.href}"
                                class="
                                ${window.location.pathname === link.href ? 'dark:bg-red-700' : ''}
                                block py-2 px-3 md:p-0 text-white rounded-sm md:bg-transparent 
                                md:hover:text-red-700 md:dark:hover:text-red-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                                aria-current="page">${link.label}</a>
                            </li>`).join('')
                    }
                </ul>
            </div>
        </div>
`

nav_elem.innerHTML = nav_content

const btn_menu = document.querySelector('#btn_menu')

btn_menu.addEventListener('click', () => {

    const nav_items = document.querySelector('#navbar-cta')
    nav_items.classList.toggle('hidden')
})
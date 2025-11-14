

const loginForm = document.getElementById('login-form');                


function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

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
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
        window.location.href = '/pages/marketplace/';
    } catch (error) {
        console.error('Error:', error);
    }
})
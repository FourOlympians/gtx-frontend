

const loginForm = document.getElementById('login-form');                


loginForm.addEventListener('submit', async (e) => { 
    e.preventDefault();

    const formData = new FormData(loginForm);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');

    console.log(username, email, password);
    try {
        const response = await fetch('http://localhost:5000/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: email, password }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error:', error);
    }
})
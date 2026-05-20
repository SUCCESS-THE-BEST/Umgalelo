const params = new URLSearchParams(window.location.search);

const token = params.get('token');

document
.getElementById('resetForm')
.addEventListener('submit', async (e) => {

    e.preventDefault();

    const password =
        document.getElementById('password').value;

    const res = await fetch(
        'http://localhost:3000/api/auth/reset-password',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token,
                password
            })
        }
    );

    const data = await res.json();

    alert(data.message);

    if (res.ok) {
        window.location.href = 'login.html';
    }
});
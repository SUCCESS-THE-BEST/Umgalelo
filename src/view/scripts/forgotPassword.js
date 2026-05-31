const API_BASE = 'https://umgalelo-production.up.railway.app'

const form = document.getElementById('forgotForm');

async function sendResetLink() {
    const email =
        document.getElementById('email').value;
        console.log(email)

    const res = await fetch(
        `${API_BASE}/api/auth/forgot-password`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        }
    );

    const data = await res.json();

    alert(data.message);
}
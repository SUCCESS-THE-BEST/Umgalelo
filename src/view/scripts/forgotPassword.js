const form = document.getElementById('forgotForm');

async function sendResetLink() {
    const email =
        document.getElementById('email').value;
        console.log(email)

    const res = await fetch(
        'http://localhost:3000/api/auth/forgot-password',
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

// form.addEventListener('submit', async (e) => {

//     e.preventDefault();

//     const email =
//         document.getElementById('email').value;
//         console.log(email)

//     const res = await fetch(
//         'http://localhost:3000/api/auth/forgot-password',
//         {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ email })
//         }
//     );

//     const data = await res.json();

//     alert(data.message);
// });
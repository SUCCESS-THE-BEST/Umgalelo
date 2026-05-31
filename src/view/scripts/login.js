const form = document.getElementById('loginForm');
const login = document.getElementById('login');


login.addEventListener('click', async (e) => {
    e.preventDefault();

    const data = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    const isValid = validate()

    if (!isValid) {
        return;
    }

    if (!document.getElementById('email').value.includes('@')) {
        document.getElementById('email-error').textContent = 'Invalid email format';
        document.getElementById('email-error').style.color = 'red';

        setTimeout(() => {
            document.getElementById('email-error').textContent = '';
        }, 1000);

        return;
    }

    const res = await fetch('https://umgalelo-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
        alert(result.message);
        return;
    }

    // Save token
    localStorage.setItem('token', result.token);
    localStorage.setItem('user_id', result.user.user_id)

    // Redirect to dashboard
    window.location.href =
    '/Umgalelo/src/view/html/dashboard.html';
});

document.getElementById('demo').addEventListener('click', (e) => {
    e.preventDefault()
    window.location.href = 'https://umgalelo-production.up.railway.app/api/auth/google';
});

function validate(){

  let isValid;

  document.querySelectorAll('.form-group input').forEach(input => {
      if (input.value === '') {
          input.style.borderColor = 'red'
          input.nextElementSibling.textContent = 'Fill in field*'
          input.nextElementSibling.style.color = 'red'
          
          isValid = false;
      }
      else{
        isValid = true;
      }

      setTimeout(() => {
            input.style.borderColor = 'rgb(214, 214, 214)'
            input.nextElementSibling.textContent = ''
          }, 1000);
  })

  return isValid
 
}
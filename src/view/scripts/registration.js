const form = document.getElementById('registerForm');
const submit = document.getElementById('submit');

submit.addEventListener('click', async (e) => {
  e.preventDefault();

  const isValid = validate()

  if (!isValid) {
    return;
  }

  //validate password
    if (document.getElementById('password').value != document.getElementById('confirmPassword').value) {
        document.getElementById('confirmpassword-error').textContent = 'Passwords dont match';
        document.getElementById('confirmpassword-error').style.color = 'red';

        setTimeout(() => {
            document.getElementById('confirmpassword-error').textContent = '';
        }, 1000);

        return;
    }

    //validate email
    if (!document.getElementById('email').value.includes('@')) {
        document.getElementById('email-error').textContent = 'Invalid email format';
        document.getElementById('email-error').style.color = 'red';

        setTimeout(() => {
            document.getElementById('email-error').textContent = '';
        }, 1000);

        return;
    }

    //check terms and conditions accepted
    const terms = document.getElementById('terms');
    if (!terms.checked) {
        document.getElementById('terms-label').style.backgroundColor = 'lightgray'
        
        setTimeout(() => {
            document.getElementById('terms-label').style.backgroundColor = 'white'
          }, 1000);

        return;
    }

  const data = {
    firstName: document.getElementById('firstname').value,
    lastName: document.getElementById('lastname').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    idNumber: document.getElementById('idNumber').value,
    password: document.getElementById('password').value
  };

  console.log(data)

  const res = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });


  const result = await res.json();
  console.log(result);


  if (res.ok) {
    window.location.href = 'login.html';
  }
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


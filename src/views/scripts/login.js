const login = document.getElementById('login');
const demo = document.getElementById('demo');

demo.addEventListener('click', (e) => {
    e.preventDefault()

    //validate if no empty fields
    const isValid = validate()

    if (!isValid) {
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

    window.location.href='dashboard.html'
})

login.addEventListener('click', (e) => {
    e.preventDefault()

    const isValid = validate()

    if (!isValid) {
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

    window.location.href='dashboard.html'
})

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
        isValid = true
      }

      setTimeout(() => {
            input.style.borderColor = 'rgb(214, 214, 214)'
            input.nextElementSibling.textContent = ''
      }, 1000);

  })

  

  // if (!document.getElementById('email').value.includes('@')) {
  //     document.getElementById('email-error').textContent = 'Incorrect email format'
  //     document.getElementById('email-error').style.color = 'red'
  //     isValid = false;

  //     setTimeout(() => {
  //           document.getElementById('email-error').textContent = ''
  //         }, 1000);
  //     return
  // }

  return isValid
 
}
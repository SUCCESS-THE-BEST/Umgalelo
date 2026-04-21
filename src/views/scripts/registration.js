const submit = document.getElementById('submit');

submit.addEventListener('click', (e) => {
    e.preventDefault()


    //check all required entries are entered
    const isValid = validate()

    if (!isValid) {
        return;
    }

    //validate password
    if (document.getElementById('password').value != document.getElementById('confirmPassword').value) {
        document.getElementById('confirm-error').textContent = 'Passwords dont match';
        document.getElementById('confirm-error').style.color = 'red';

        setTimeout(() => {
            document.getElementById('confirm-error').textContent = '';
        }, 1000);

        return;
    }

    //validate email
    if (!document.getElementById('email').value.includes('@')) {
        document.getElementById('emailError').textContent = 'Invalid email format';
        document.getElementById('emailError').style.color = 'red';

        setTimeout(() => {
            document.getElementById('emailError').textContent = '';
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

    window.location.href='login.html'
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
        isValid = true;
      }

      setTimeout(() => {
            input.style.borderColor = 'rgb(214, 214, 214)'
            input.nextElementSibling.textContent = ''
          }, 1000);
  })

  return isValid
 
}
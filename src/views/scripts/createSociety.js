const create = document.getElementById('create');
const cancel = document.getElementById('cancel');

create.addEventListener('click', (e) => {
    e.preventDefault()

    const isValid = validate()

    if (!isValid) {
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
        isValid = true;
      }

      setTimeout(() => {
            input.style.borderColor = 'rgb(214, 214, 214)'
            input.nextElementSibling.textContent = ''
          }, 1000);
  })

  return isValid
 
}
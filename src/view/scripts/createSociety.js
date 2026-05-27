// let token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'login.html';
}

window.onload = async () => {
    await loadUser();
    await loadSidebarSocieties();
};

// const loadUser = async () => {
//     const res = await fetch('http://localhost:3000/api/auth/profile', {
//         headers: {
//         Authorization: `Bearer ${token}`
//         }
//     });

//     const [user] = await res.json();
//     console.log(user)
//     document.getElementById('userName').innerText = user.first_name + ' ' + user.last_name;
//     document.getElementById('userEmail').innerText = user.email;
    
// };

// const logout = () => {
//   localStorage.removeItem('token');
//   window.location.href = 'login.html';
// };

// const loadSidebarSocieties = async () => {
//   const res = await fetch('http://localhost:3000/api/dashboard/societies', {
//     headers: {
//       Authorization: `Bearer ${token}`
//     }
//   });

//   const societies = await res.json();

//   const container = document.getElementById('sidebarSocieties');
//   container.innerHTML = '';

//   societies.forEach(s => {
//     const isAdmin = s.role === 'admin';
    
//     const item = `
//       <div class="nav-item" onclick="openSociety(${s.id}, '${s.role}')">
//         <img src="../images/networking.png" alt="" />
//         <span>${s.society_name}</span>
//         ${isAdmin ? '<span class="admin-tag">Admin</span>' : ''}
//       </div>
//     `;

//     container.innerHTML += item;
//   });
// };

// const openSociety = (id, role) => {

//   localStorage.setItem("society_id", id);
//   localStorage.setItem("role", role);

//   window.location.href = `society.html?id=${id}`;
// };

const create = document.getElementById('create');
const cancel = document.getElementById('cancel');

create.addEventListener('click', async (e) => {
    e.preventDefault();

    const isValid = validate()

    if (!isValid) {
        return;
    }

    const data = {
        societyName: document.getElementById('societyName').value,
        description: document.getElementById('description').value,
        monthlyContribution: document.getElementById('monthlyContribution').value,
        coverAmount: document.getElementById('coverAmount').value,
        waitingPeriod: document.getElementById('waitingPeriod').value,
        additionalRules: document.getElementById('additionalRules').value,
        province: document.getElementById('province').value,
        city: document.getElementById('city').value,
        maximumMembers: document.getElementById('maxMembers').value,
        minimumAge:document.getElementById('minAge').value
    }

    console.log(data)

    const res = await fetch('http://localhost:3000/api/societies/create', {        
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
        document.getElementById('message').textContent = 'Society created successfully!'
        window.scrollTo(0, 0)
    }

    if (!res.ok) {
      document.getElementById('message').textContent = result.message;
      document.getElementById('message').style.color = 'red';
      window.scrollTo(0, 0)
      return;
    }

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2500);
})

cancel.onclick = () => {
  window.location.href = 'dashboard.html';
};

function validate(){

  let isValid;

  document.querySelectorAll('.form-group input, textarea').forEach(input => {
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

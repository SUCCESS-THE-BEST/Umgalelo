// const token = localStorage.getItem('token');

const update = document.getElementById('update');
const cancel = document.getElementById('cancel');

window.onload = async () => {
    await loadUserData();
    await loadUser();
    await loadSidebarSocieties();
    await loadNotifications();
    await loadSocieties();
    await renderDate();
};

// ============== RENDER DATE ================
function renderDate(){
    const dateEl = document.getElementById('date');
    const date = new Date();

    const formatter = new Intl.DateTimeFormat('en-ZA', { 
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    dateEl.textContent = formatter.format(date);
}


// ============= LOAD USER DATA ========================
const loadUserData = async () => {
    const res = await fetch('http://localhost:3000/api/auth/profile', {
        headers: {
        Authorization: `Bearer ${token}`
        }
    });
     
    const [user] = await res.json();
    console.log(user);
    document.getElementById('firstName').value = user.first_name
    document.getElementById('firstName').disabled = true
    document.getElementById('firstName').style.background = 'none'
    document.getElementById('firstName').style.border = 'none'

    document.getElementById('lastName').value = user.last_name
    document.getElementById('lastName').disabled = true
    document.getElementById('lastName').style.background = 'none'
    document.getElementById('lastName').style.border = 'none'

    document.getElementById('idNumber').value = user.id_number
    document.getElementById('idNumber').disabled = true
    document.getElementById('idNumber').style.background = 'none'
    document.getElementById('idNumber').style.border = 'none'

    document.getElementById('email').value = user.email
    document.getElementById('email').disabled = true
    document.getElementById('email').style.background = 'none'
    document.getElementById('email').style.border = 'none'

    document.getElementById('phone').value = user.phone
    document.getElementById('phone').disabled = true
    document.getElementById('phone').style.background = 'none'
    document.getElementById('phone').style.border = 'none'

    parseIDNumber(user.id_number)

};


update.addEventListener('click', async (e) => {
    e.preventDefault();

    const message = document.getElementById('message');

    try {
        // ================= UPDATE TEXT PROFILE DETAILS =================

        const data = {
            addressLine1: document.getElementById('addressLine1').value,
            city: document.getElementById('city').value,
            province: document.getElementById('province').value,
            postalCode: document.getElementById('postalCode').value,
            nextOfKinName: document.getElementById('nextOfKinName').value,
            nextOfKinPhone: document.getElementById('nextOfKinPhone').value
        };

        const res = await fetch('http://localhost:3000/api/users/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            message.textContent = result.message;
            message.style.color = 'red';
            return;
        }

        // ================= UPLOAD FILES =================

        const formData = new FormData();

        const profilePhoto = document.getElementById('profilePhoto').files[0];
        const idDocument = document.getElementById('idDocument').files[0];
        const bankingProof = document.getElementById('bankingProof').files[0];

        if (profilePhoto) {
            formData.append('profilePhoto', profilePhoto);
        }

        if (idDocument) {
            formData.append('idDocument', idDocument);
        }

        if (bankingProof) {
            formData.append('bankingProof', bankingProof);
        }

        const hasFiles =
            profilePhoto || idDocument || bankingProof;

        if (hasFiles) {
            const uploadRes = await fetch(
                'http://localhost:3000/api/users/upload-documents',
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const uploadResult = await uploadRes.json();

            if (!uploadRes.ok) {
                message.textContent = uploadResult.message;
                message.style.color = 'red';
                return;
            }

            if (uploadResult.profilePhoto) {
                document.querySelectorAll('.user-avatar').forEach(img => {
                    if (uploadResult.profilePhoto) {

                        document.querySelectorAll('.user-avatar')
                            .forEach(img => {

                                img.src = img.src = uploadResult.profilePhoto;
                            });
                    }
                });
            }

            message.textContent = uploadResult.message;
            message.style.color = 'green';
            return;
        }

        // ================= SUCCESS MESSAGE =================

        message.textContent = result.message;
        message.style.color = 'green';

    } catch (error) {
        console.log(error);

        message.textContent = 'Something went wrong while updating profile';
        message.style.color = 'red';
    }
});

cancel.onclick = () => {
  window.scrollTo(0, 0)
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

//     document.getElementById('profileName').innerText = user.first_name + ' ' + user.last_name;
//     document.getElementById('profileEmail').innerText = user.email;
    
//     const date = new Date()
//     document.getElementById('date').textContent = `${formatter.format(date)}`

//     if (user.profile_photo) {
//     document.querySelectorAll('.user-avatar').forEach(img => {
//         img.src = `http://localhost:3000${user.profile_photo}`;
//     });
// }
    
// };

const formatter = new Intl.DateTimeFormat('en-ZA', { 
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
});

// const loadSidebarSocieties = async () => {
//     const res = await fetch('http://localhost:3000/api/dashboard/societies', {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//     });

//     const societies = await res.json();

//     const container = document.getElementById('sidebarSocieties');
//     container.innerHTML = '';

//     societies.forEach(s => {
//       const isAdmin = s.role === 'admin';

//       const item = `
//         <div class="nav-item" onclick="openSociety(${s.id}, '${s.role}')">
//           <img src="../images/networking.png" alt="" />
//           <span>${s.society_name}</span>
//           ${isAdmin ? '<span class="admin-tag">Admin</span>' : ''}
//         </div>
//       `;

//       container.innerHTML += item;
//     });
// };

// const openSociety = (id, role) => {

//   localStorage.setItem("society_id", id);
//   localStorage.setItem("role", role);

//   window.location.href = `society.html?id=${id}`;
// };

//parse id number
function parseIDNumber(id) {
    // Extract parts
    const yy = id.slice(0, 2); //year
    const mm = id.slice(2, 4); //month
    const dd = id.slice(4, 6); //day
    const genderDigits = parseInt(id.slice(6, 10)); //gender

    // Determine century
    const currentYY = new Date().getFullYear() % 100;
    const year = parseInt(yy) <= currentYY ? `20${yy}` : `19${yy}`;

    // Validate month and day ranges
    const month = parseInt(mm);
    const day = parseInt(dd);

    if (month < 1 || month > 12) throw new Error('Invalid month in ID number');
    if (day < 1 || day > 31)     throw new Error('Invalid day in ID number');

    // Build DOB as a proper Date object + formatted string
    const dob = new Date(`${year}-${mm}-${dd}`);
    if (isNaN(dob.getTime())) throw new Error('Invalid date in ID number');

    // Determine gender
    const gender = genderDigits >= 5000 ? 'Male' : 'Female';

      // Age
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    // Subtract 1 if birthday hasn't happened yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    document.getElementById('gender').value = gender
    document.getElementById('gender').disabled = true
    document.getElementById('gender').style.background = 'none'
    document.getElementById('gender').style.border = 'none'

    document.getElementById('dob').value = dob.toISOString().split('T')[0];
    document.getElementById('dob').disabled = true
    document.getElementById('dob').style.background = 'none'
    document.getElementById('dob').style.border = 'none'


    document.getElementById('age').value = age
    document.getElementById('age').disabled = true
    document.getElementById('age').style.background = 'none'
    document.getElementById('age').style.border = 'none'
  
}

// =============== NOTIFICATIONS ==================
async function loadNotifications() {

    try {

        const res = await fetch(
            'http://localhost:3000/api/notifications',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

       

        const notifications = await res.json();
        console.log(notifications)

        const count = notifications.filter(n => !n.is_read).length;

        document.getElementById('notificationCount').textContent = count;

        // hide badge if no unread notifications
        const badge = document.getElementById('notificationCount');

        if (count === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'flex';
            badge.textContent = count;
        }

        const container =
            document.getElementById('notificationList');

        container.innerHTML = '';

        if (notifications.length === 0) {

            container.innerHTML = `
                <div class="empty-notifications">
                    No notifications
                </div>
            `;

            return;
        }

        notifications.forEach(n => {

        const notificationClass = n.is_read
            ? 'notification-item read'
            : 'notification-item unread';

        container.innerHTML += `

            <div 
                class="${notificationClass}"
                onclick="handleNotificationClick(
                    ${n.notification_id},
                    ${n.society_id || null},
                    '${n.type}'
                )"
            >

                <p>${n.message}</p>

                <div class="notification-time">
                    <p>${n.society_name || 'Umgalelo'}</p>
                    <p>
                        ${new Date(n.created_at)
                            .toLocaleDateString()}
                    </p>
                </div>

                ${
                    !n.is_read
                    ? `
                        <button
                            class="mark-read-btn"
                            onclick="
                                event.stopPropagation();
                                markAsRead(${n.notification_id})
                            "
                        >
                            Mark as read
                        </button>
                    `
                    : ''
                }

            </div>
        `;
    });

    } catch (err) {
        console.log(err);
    }
}

// =================== MARK AS READ ====================
async function markAsRead(notificationId) {

    try {

        const res = await fetch(
            `http://localhost:3000/api/notifications/read/${notificationId}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        console.log(data);

        // reload notifications
        loadNotifications();

    } catch (err) {
        console.log(err);
    }
}

async function handleNotificationClick(notificationId, societyId, type) {
    try {
        await fetch(
            `http://localhost:3000/api/notifications/read/${notificationId}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (type === 'welcome') {
            window.location.href = 'browse.html';
            return;
        }

        if (
            type === 'join_request_sent' ||
            type === 'rejected'
        ) {
            loadNotifications();
            return;
        }

        if (type === 'approved' && societyId) {
            localStorage.setItem('society_id', societyId);
            window.location.href = `society.html?id=${societyId}`;
            return;
        }

        if (
            type !== 'join_request_sent' &&
            type !== 'rejected' &&
            societyId
        ) {
            localStorage.setItem('society_id', societyId);
            window.location.href = `society.html?id=${societyId}`;
        }

    } catch (err) {
        console.log(err);
    }
}

// =================== LOAD SOCIETY CARDS ====================
const loadSocieties = async () => {

  const res = await fetch(
    'http://localhost:3000/api/dashboard/societies',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const societies = await res.json();

  const container =
    document.querySelector('.society-list');

  container.innerHTML = '';

  document.getElementById('count').innerText =
    `(${societies.length})`;

  societies.forEach(s => {

    const initials = s.society_name
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2);

    const canLeave = s.role !== 'admin';

    const card = `
      <div class="society-item-wrapper">

        <div 
          class="society-item"
          onclick="openSociety(${s.id}, '${s.role}')"
        >
          <div class="society-avatar">
            ${initials}
          </div>

          <div class="society-info">
            <h3>${s.society_name}</h3>
            <p>Joined ${s.joined}</p>
          </div>
        </div>

        ${
          canLeave
          ? `
            <button
              class="leave-btn"
              onclick="event.stopPropagation();
              leaveSociety(${s.id})"
            >
              Leave
            </button>
          `
          : `
            <span class="admin-badge-label">
              Admin
            </span>
          `
        }

      </div>
    `;

    container.innerHTML += card;
  });
};

// ============ LEAVE SOCIETY ================
async function leaveSociety(societyId) {

    const confirmLeave = confirm(
        'Are you sure you want to leave this society?'
    );

    if (!confirmLeave) return;

    try {

        const res = await fetch(
            `http://localhost:3000/api/memberships/leave/${societyId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        alert(data.message);

        loadSocieties();
        loadSidebarSocieties();

    } catch (err) {

        console.log(err);
        alert('Error leaving society');
    }
}

let token = localStorage.getItem('token')

window.onload = async () => {
  await loadUser();
  await loadSocieties();
  await loadSidebarSocieties();
};

// ========================= LOAD SIDEBAR USER INFO =============================
const loadUser = async () => {
    const res = await fetch('http://localhost:3000/api/auth/profile', {
        headers: {
        Authorization: `Bearer ${token}`
        }
    });

    const [user] = await res.json();
    console.log(user)
    document.getElementById('userName').innerText = user.first_name + ' ' + user.last_name;
    document.getElementById('userEmail').innerText = user.email;
    
};


// =========================== LOAD SIDEBAR SOCIETIES ==============================
const loadSidebarSocieties = async () => {
  const res = await fetch('http://localhost:3000/api/dashboard/societies', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const societies = await res.json();

  const container = document.getElementById('sidebarSocieties');
  container.innerHTML = '';

  societies.forEach(s => {
    const isAdmin = s.role === 'admin';

    const item = `
      <div class="nav-item" onclick="openSociety(${s.id}, '${s.role}')">
        <img src="../images/networking.png" alt="" />
        <span>${s.society_name}</span>
        ${isAdmin ? '<span class="admin-tag">Admin</span>' : ''}
      </div>
    `;

    container.innerHTML += item;
  });
};


// ================= OPEN SOCIETY ON SIDEBAR ============================
const openSociety = (id, role) => {

  localStorage.setItem("society_id", id);
  localStorage.setItem("role", role);

  window.location.href = `society.html?id=${id}`;
};


const API = "http://localhost:3000/api/societies/browse";

const searchInput = document.getElementById("searchInput");
const provinceFilter = document.getElementById("provinceFilter");

let timeout = null;

// =============== LIVE SEARCH (debounced) =========================
searchInput.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(loadSocieties, 400); // wait 400ms
});

// ================== PROVINCE FILTER ==================================
provinceFilter.addEventListener("change", loadSocieties);

async function loadSocieties() {
    try {
        const search = searchInput.value;
        const province = provinceFilter.value;

        const res = await fetch(
            `${API}?search=${encodeURIComponent(search)}&province=${encodeURIComponent(province)}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();
        console.log(data)
        renderSocieties(data);

    } catch (err) {
        console.error(err);
    }
}

// ========================== RENDER SOCIETY CARDS =================================
function renderSocieties(societies) {
    const container = document.querySelector(".societies-grid");
    container.innerHTML = "";

    societies.forEach(s => {
        const initials = s.society_name
            .split(" ")
            .map(w => w[0])
            .join("")
            .slice(0, 2);

        let buttonText = "Request to Join";
        let disabled = "";

        if (s.is_member) {
            buttonText = "Already a member";
            disabled = "disabled";
        } else if (s.requested) {
            buttonText = "Request Pending";
            disabled = "disabled";
        } else if (s.current_members >= s.maximum_members) {
            buttonText = "Society Full";
            disabled = "disabled";
        }

        const card = `
        <article class="society-card ${disabled ? 'disabled' : ''}">
            <div class="card-header">
                <div class="society-logo">${initials}</div>
                <div class="society-info">
                    <h3>${s.society_name}</h3>
                    <img src="../images/location.png" alt="location">
                    <p class="location">${s.city}; ${s.province}</p>
                </div>
            </div>

            <p class="description">${s.description || "No description available"}</p>

            <div class="stats">
                <div class="stat">
                    <span class="label">Contribution</span>
                    <span class="value">R${s.monthly_contribution}/pm</span>
                </div>
                <div class="stat">
                    <span class="label">Cover</span>
                    <span class="value">R${s.cover_amount}</span>
                </div>
                <div class="stat">
                    <span class="label">Capacity</span>
                    <span class="value">${s.current_members}/${s.maximum_members}</span>
                </div>
            </div>

            <div class="card-actions">
                <button class="btn-primary" 
                    onclick="requestJoin(${s.society_id})" ${disabled}>
                    ${buttonText}
                </button>
                <button class="btn-outline">View</button>
            </div>
        </article>
        `;

        container.innerHTML += card;
    });
}


// ===================== SUBMIT JOIN REQUEST =======================
async function requestJoin(societyId) {
    try {
        const res = await fetch("http://localhost:3000/api/joinRequest/request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ society_id: societyId })
        });

        const data = await res.json();

        alert(data.message);

        loadSocieties();

    } catch (err) {
        console.error(err);
    }
}
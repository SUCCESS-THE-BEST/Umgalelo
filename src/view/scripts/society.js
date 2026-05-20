const params = new URLSearchParams(window.location.search);
const societyId = params.get("id");
console.log(societyId)

if (!societyId) {
    alert("No society selected");
    window.location.href = "browse.html";
}

const token = localStorage.getItem('token')


// ================ LOAD SOCIETY PAGE =======================
async function loadSociety() {
    const res = await fetch(`http://localhost:3000/api/societies/society/${societyId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await res.json();

    renderStats(data.total_contributions, data.total_claims, data.months_contributions)
    renderSociety(data.society);
    renderMembers(data.members);
    renderRequests(data.requests);
    //renderClaims(data.claims);
    console.log(data.society)
}

window.onload = async () => {
  await loadSidebarSocieties();
  await loadUser();
};

loadSociety();

function renderStats(contributions, claims, this_month) {
    document.getElementById('totalCollected').textContent = `R${contributions.total}`
    document.getElementById('totalClaims').textContent = `${claims.count}`
    document.getElementById('collectedThisMonth').textContent = `R${this_month.total}`
}

function renderMembers(members) {

    document.getElementById('membersCount').textContent = `Members (${members.length})`
    document.getElementById("memberCount").textContent = `${members.length} members`;

    const container = document.getElementById("membersList");

    container.innerHTML = members.map(m => `
        <div class="member-item">
            <div class="member-avatar">
                ${m.first_name[0]}${m.last_name[0]}
            </div>

            <div class="member-info">
                <p class="member-name">${m.first_name} ${m.last_name}</p>
                <p class="member-since">
                    Member since ${new Date(m.joined_at).toLocaleDateString()}
                </p>
            </div>

            ${m.role === 'admin' ? `<span class="member-badge">Admin</span>` : ''}
        </div>
    `).join("");

}

function renderRequests(requests) {

    document.getElementById('joinRequestsCount').textContent = `Join Requests (${requests.length})`
    
    const container = document.getElementById("requestsList");

    container.innerHTML = requests.map(r => `
        <div class="member-item">
            <div class="member-avatar">
                ${r.first_name[0]}${r.last_name[0]}
            </div>

            <div class="member-info">
                <p class="member-name">${r.first_name} ${r.last_name}</p>
                <p class="member-since">
                    Requested ${new Date(r.requested_at).toLocaleDateString()}
                </p>
            </div>

            <div class="request-actions">
                <button onclick="handleRequest(${r.request_id}, 'approve')" class="btn btn-primary btn-sm">Approve</button>
                <button onclick="handleRequest(${r.request_id}, 'reject')" class="btn btn-outline btn-sm">Reject</button>
            </div>
        </div>
    `).join("");
}

async function handleRequest(id, action) {
    console.log(action)
    await fetch(`http://localhost:3000/api/joinRequest/${id}/requests`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ action })
    });

    loadSociety(); // refresh
}


function renderSociety(s) {
    const initials = s.society_name
            .split(" ")
            .map(w => w[0])
            .join("")
            .slice(0, 2);
    document.getElementById("societyLogo").textContent = initials;

    document.getElementById("societyName").textContent = s.society_name;
    //document.getElementById("memberCount").textContent = `${s.member_count} members`;
    document.getElementById("monthlyContribution").textContent = `R${s.monthly_contribution}/month`;
    document.getElementById("locationText").innerHTML =
        `<img src="../images/location.png" width="15px"> ${s.city}, ${s.province}`;

    document.getElementById("societyDescription").textContent = s.description;

    document.getElementById("detailContribution").textContent = `R${s.monthly_contribution}/month`;
    document.getElementById("coverAmount").textContent = `R${s.cover_amount}`;
    document.getElementById("maxMembers").textContent = s.maximum_members;
    document.getElementById("adminName").textContent = s.first_name + ' ' + s.last_name;

    //payment card
    document.getElementById('society-name').value = s.society_name;
    document.getElementById('societyname').value = s.society_name;
    document.getElementById('amount').value = s.monthly_contribution
    const now = new Date();

    const month = String(now.getMonth() + 1).padStart(2, '0');

    document.getElementById('month').value =
    `${now.getFullYear()}-${month}`;
    document.getElementById('claim_amount').value = s.cover_amount
}

// ======= LOAD SIDEBAR SOCIETIES ========
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
        ${isAdmin ? '<span class="admin-tag active">Admin</span>' : ''}
      </div>
    `;

    container.innerHTML += item;
  });
};

// ===== OPEN SIDEBAR SOCIETY ========
const openSociety = (id, role) => {

  localStorage.setItem("society_id", id);
  localStorage.setItem("role", role);

  window.location.href = `society.html?id=${id}`;
};

// ========== LOAD USER INFO ON SIDEBAR ===========
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
    document.getElementById('member').value = user.first_name + ' ' + user.last_name;
    document.getElementById('member-name').value = user.first_name + ' ' + user.last_name;
    
};


// =========== MAKE PAYMENT / SUBMIT CLAIM =========

const btnPay = document.getElementById('submitPayment')
const btnClaim = document.getElementById('submitClaim')

btnPay.addEventListener('click', async (e) => {
    e.preventDefault();

    const societyId = localStorage.getItem("society_id");

    if (!societyId) {
        alert("No society selected");
        return;
    }

    const data = {
        amount: document.getElementById('amount').value,
        month: document.getElementById('month').value
    }

    const res = await fetch(`http://localhost:3000/api/contributions/contribute/${societyId}`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
        alert(result.message);
        document.getElementById('paymentModal').classList.remove('active');
    }

    if (!res.ok) {
        alert(result.message)
    }

})

btnClaim.addEventListener('click', async (e) => {
    e.preventDefault();

    const societyId = localStorage.getItem("society_id");

    if (!societyId) {
        alert("No society selected");
        return;
    }

    const data = {
        deceased_name: document.getElementById('deceased-name').value,
        relationship: document.getElementById('deceased-relationship').value,
        claim_amount: document.getElementById('claim_amount').value,
        date_of_passing: document.getElementById('date_of_passing').value
    }

    const res = await fetch(`http://localhost:3000/api/claims/claim/${societyId}`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
        alert(result.message);
        document.getElementById('claimModal').classList.remove('active');
    }

    if (!res.ok) {
        alert(result.message)
    }
})
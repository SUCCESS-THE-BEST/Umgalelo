let token = localStorage.getItem('token')

window.onload = async () => {
    await loadUser();
    await loadSidebarSocieties();
    await loadSociety();
    // await loadClaimsSummary();
    //await loadClaims();
};

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

const logout = () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
};

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

const openSociety = (id, role) => {

  localStorage.setItem("society_id", id);
  localStorage.setItem("role", role);

  window.location.href = `society.html?id=${id}`;
};

let allClaims = [];
//load society
async function loadSociety() {
    const res = await fetch(`http://localhost:3000/api/societies/society/${localStorage.getItem('society_id')}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await res.json();

    renderStats(data.total_contributions, data.total_claims, data.months_contributions)
    renderSociety(data.society, data.members);
    allClaims = data.claims;
    renderClaims(allClaims);
}

function renderStats(contributions, claims, this_month) {
    document.getElementById('totalCollected').textContent = `R${contributions.total}`
    document.getElementById('totalClaims').textContent = `${claims.count}`
    document.getElementById('collectedThisMonth').textContent = `R${this_month.total}`
}

function renderSociety(s, m) {

    const initials = s.society_name
            .split(" ")
            .map(w => w[0])
            .join("")
            .slice(0, 2);
    document.getElementById("societyLogo").textContent = initials;

    document.getElementById("societyName").textContent = s.society_name;
    document.getElementById("memberCount").textContent = `${m.length} members`;
    document.getElementById("monthlyContribution").textContent = `R${s.monthly_contribution}/month`;
    document.getElementById("locationText").innerHTML =
        `<img src="../images/location.png" width="15px"> ${s.city}, ${s.province}`;


    //payment card
    document.getElementById('society-name').value = s.society_name;
    document.getElementById('societyname').value = s.society_name;
    document.getElementById('amount').value = s.monthly_contribution
    document.getElementById('month').value = `${new Date().getFullYear()}-0${new Date().getMonth()}`
    document.getElementById('claim_amount').value = s.cover_amount
}


function renderClaims(claims) {
    const container = document.getElementById("claimsContainer");

    container.innerHTML = "";

    if (claims.length === 0) {

        const card = document.createElement("section");
        card.className = "card claim-card";

        card.innerHTML = "<p>No claims record</p>";

        container.appendChild(card)
        return;
    }

    claims.forEach(c => {
        const card = document.createElement("section");
        card.className = "card claim-card";

        card.innerHTML = `
            <div class="claim-header">
                <div class="claim-title-section">
                    <h3 class="claim-name">${c.first_name + ' ' + c.last_name}</h3>
                    <p class="claim-date">Submitted ${new Date(c.claim_date).toLocaleDateString()}</p>
                </div>
                <span class="claim-status status-${c.status}">
                    ${c.status}
                </span>
            </div>

            <div class="claim-details-grid">
                <div class="detail-box">
                    <p class="detail-label">Relationship</p>
                    <p class="detail-value">${c.relationship}</p>
                </div>
                <div class="detail-box">
                    <p class="detail-label">Amount</p>
                    <p class="detail-value">R${c.claim_amount}</p>
                </div>
                <div class="detail-box">
                    <p class="detail-label">Date of Passing</p>
                    <p class="detail-value">${c.date_of_death}</p>
                </div>
            </div>

            ${c.status === 'pending' ? renderClaimActions(c) : ''}
        `;

        container.appendChild(card);
    });

    loadClaimsSummary();

}

function renderClaimActions(c) {

  const userRole = localStorage.getItem("role");

  if (
      c.status === "pending" &&
      userRole === "admin"
  ) {
      return `
        <div class="claim-actions">
          <button class="btn btn-primary btn-sm" 
            onclick="handleClaim(${c.claim_id}, 'approved')">
            Approve
          </button>

          <button class="btn btn-outline btn-sm" 
            onclick="handleClaim(${c.claim_id}, 'rejected')">
            Reject
          </button>
        </div>
      `;
  }

  return '';
}

async function handleClaim(claimId, action) {
  if (!confirm(`Are you sure you want to ${action} this claim?`)) return;

  try {
    const res = await fetch(`http://localhost:3000/api/claims/handle/${claimId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ 
        status: action,
        society_id: localStorage.getItem('society_id')
       })
    });

    const data = await res.json();

    alert(data.message);

    // reload claims after update
    loadClaims();

  } catch (err) {
    console.error(err);
    alert("Error processing claim");
  }
}

document.getElementById('overview').addEventListener('click', (e) => {
    e.preventDefault()
  window.location.href = `society.html?id=${localStorage.getItem("society_id")}`;
})


async function loadClaimsSummary() {

    const societyId = localStorage.getItem("society_id");

    const res = await fetch(`http://localhost:3000/api/claims/summary/${societyId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await res.json();

}   

function renderClaimsSummary(data) {

    const container = document.getElementById("claimsContainer");

    container.innerHTML = "";

    const summary = document.createElement('section');

    summary.classList.add('card');
    summary.classList.add('summary-card');

    summary.innerHTML = `
        <h3 class="summary-title">Claims Summary</h3>

        <div class="summary-divider"></div>

        <div class="summary-grid">

            <div class="summary-row">
                <span class="summary-label">Total claims paid</span>
                <span class="summary-value">
                    ${data.total_paid}
                </span>
            </div>

            <div class="summary-row">
                <span class="summary-label">Total amount paid out</span>
                <span class="summary-value">
                    R${Number(data.total_amount).toLocaleString()}
                </span>
            </div>

            <div class="summary-row">
                <span class="summary-label">Pending Review</span>
                <span class="summary-value">
                    ${data.pending}
                </span>
            </div>

            <div class="summary-row">
                <span class="summary-label">Society Wallet</span>
                <span class="summary-value">
                    R${Number(data.wallet_balance).toLocaleString()}
                </span>
            </div>

        </div>
    `;

    container.appendChild(summary);
}

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter;

        if (filter === "all") {
            renderClaims(allClaims);
            return;
        }

        const filtered = allClaims.filter(
            c => c.status === filter
        );

        renderClaims(filtered);
    });

});
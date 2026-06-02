let allClaims = [];

window.onload = async () => {
    const data = await initSocietyPage();

    allClaims = data.claims || [];

    renderClaims(allClaims);
};

// ================ RENDER/DISPLAY CLAIMS ==================
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

        card.addEventListener("click", () => {
            openClaimDetails(c);
        });

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

function openClaimDetails(claim) {

    const fakeCertificate = "https://res.cloudinary.com/dfkvu3ixa/image/upload/v1780414878/death_cert_v0mn8x.jpg";

    document.getElementById("viewClaimContent").innerHTML = `
        <div class="society-details">

            <div class="detail-item">
                <p class="detail-label">Claimant</p>
                <p class="detail-value">
                    ${claim.first_name} ${claim.last_name}
                </p>
            </div>

            <div class="detail-item">
                <p class="detail-label">Deceased</p>
                <p class="detail-value">
                    ${claim.deceased_name}
                </p>
            </div>

            <div class="detail-item">
                <p class="detail-label">Relationship</p>
                <p class="detail-value">
                    ${claim.relationship}
                </p>
            </div>

            <div class="detail-item">
                <p class="detail-label">Claim Amount</p>
                <p class="detail-value">
                    R${claim.claim_amount}
                </p>
            </div>

            <div class="detail-item">
                <p class="detail-label">Date of Passing</p>
                <p class="detail-value">
                    ${claim.date_of_death}
                </p>
            </div>

            <div class="detail-item">
                <p class="detail-label">Status</p>
                <p class="detail-value">
                    ${claim.status}
                </p>
            </div>

        </div>

        <div class="card" style="margin:20px 0 0 0;">
            <div class="card-header">
                <h2>Death Certificate</h2>
            </div>

            <div class="card-divider"></div>

            <img
                src="${fakeCertificate}"
                style="
                    width:100%;
                    border-radius:12px;
                    object-fit:contain;
                "
            >
        </div>
    `;

    document
        .getElementById("viewClaimModal")
        .classList.add("active");
}

function closeViewClaimModal() {
    document.getElementById("viewClaimModal").classList.remove("active");
}

// ===============ADMIN ONLY (APPROVE/REJECT CLAIM) =====================
function renderClaimActions(c) {

    const userRole = localStorage.getItem("role");

    const currentUserId = Number(localStorage.getItem("user_id"));
    console.log(currentUserId)
    const claimOwnerId = Number(c.user_id);
    console.log(claimOwnerId)

    let buttons = '';

    // ================= ADMIN BUTTONS =================
    if (
        c.status === "pending" &&
        userRole === "admin"
    ) {

        buttons += `
            <button
                class="btn btn-primary btn-sm"
                onclick="event.stopPropagation(); handleClaim(${c.claim_id}, 'approved')"
            >
                Approve
            </button>

            <button
                class="btn btn-outline btn-sm"
                onclick="event.stopPropagation(); handleClaim(${c.claim_id}, 'rejected')"
            >
                Reject
            </button>
        `;
    }

    // ================= MEMBER CANCEL =================
    if (
    c.status === "pending" &&
    claimOwnerId === currentUserId
    ) {
        buttons += `
            <button
                class="btn btn-outline btn-sm"
                onclick="cancelClaim(${c.claim_id})"
            >
                Cancel Claim
            </button>
        `;
    }

    return buttons
        ? `<div class="claim-actions">${buttons}</div>`
        : '';
}

// ==================== APPROVE/REJECT CLAIM ======================
async function handleClaim(claimId, action) {
  if (!confirm(`Are you sure you want to ${action} this claim?`)) return;

  try {
    const res = await fetch(`${API_BASE}/api/claims/handle/${claimId}`, {
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

// ====================== CANCEL CLAIM ========================
async function cancelClaim(claimId) {

    const confirmed = confirm(
        'Cancel this claim?'
    );

    if (!confirmed) return;

    try {

        const res = await fetch(
            `${API_BASE}/api/claims/${claimId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        alert(data.message);

        loadSociety();

    } catch (err) {

        console.log(err);

        alert('Error cancelling claim');
    }
}

// ========================= CLAIMS SUMMARY ==============================
async function loadClaimsSummary() {

    const societyId = localStorage.getItem("society_id");

    const res = await fetch(`${API_BASE}/api/claims/summary/${societyId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await res.json();

}   

// =================== RENDER/DISPLAY CLAIMS SUMMARY ========================
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


// ============ FILTER CLAIMS =======================
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
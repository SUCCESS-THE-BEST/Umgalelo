window.onload = async () => {
  await loadUser();
  await loadSocieties();
  await loadSidebarSocieties();
};


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

const API = `${API_BASE}/api/societies/browse`;

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
        renderSocieties(data);

    } catch (err) {
        console.error(err);
    }
}

// ========================== RENDER SOCIETY CARDS =================================
function renderSocieties(societies) {
    const container = document.querySelector(".societies-grid");
    container.innerHTML = "";

    if (societies.length === 0){
        container.innerHTML = `
        <div class="no-search-results">
            <p>Sorry, no societies found</p>
            <img src="../images/no-results.png">
        </div>
        `;
    }
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
                <button class="btn-outline" onclick="openSocietyModal(${s.society_id})">
                    View
                </button>
            </div>
        </article>
        `;

        container.innerHTML += card;
    });
}


// ===================== SUBMIT JOIN REQUEST =======================
async function requestJoin(societyId) {
    try {
        const res = await fetch(`${API_BASE}/api/joinRequest/request`, {
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

// ============== VIEW BUTTON CLICK =================
async function openSocietyModal(societyId) {
    try {
        const res = await fetch(`${API_BASE}/api/societies/society/${societyId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();
        const s = data.society;

        document.getElementById("modalSocietyName").textContent = s.society_name;
        document.getElementById("modalSocietyLocation").textContent = `${s.city}, ${s.province}`;
        document.getElementById("modalSocietyDescription").textContent = s.description || "No description available";

        document.getElementById("modalContribution").textContent = `R${s.monthly_contribution}`;
        document.getElementById("modalCover").textContent = `R${s.cover_amount}`;
        document.getElementById("modalMaxMembers").textContent = s.maximum_members;
        document.getElementById("modalWaitingPeriod").textContent = s.waiting_period || "Not specified";
        document.getElementById("modalAdmin").textContent = `${s.first_name} ${s.last_name}`;
        document.getElementById("modalFounded").textContent = formatDate(s.created_at);
        document.getElementById("modalAdditionalRules").textContent = s.additional_rules || "No additional rules provided.";
        document.getElementById("societyViewModal").classList.add("active");

    } catch (err) {
        console.error(err);
        alert("Could not load society details");
    }
}

function closeSocietyModal() {
    document.getElementById("societyViewModal").classList.remove("active");
}

function formatDate(dateString) {
    if (!dateString) return "Not specified";

    return new Date(dateString).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}
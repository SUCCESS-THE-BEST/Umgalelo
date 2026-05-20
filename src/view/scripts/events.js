let token = localStorage.getItem('token')

window.onload = async () => {
    await loadUser();
    await loadSidebarSocieties();
    await loadSociety();
    await loadEvents();
};

const eventModal = document.getElementById("eventDetailsModal");
const closeBtn = document.getElementById("closeEventDetails");

document.querySelectorAll(".event-card").forEach(card => {
    card.addEventListener("click", async () => {
        const eventId = card.dataset.eventId;

        const res = await fetch(`http://localhost:3000/api/events/single/${eventId}`);
        const event = await res.json();
        console.log(event)
        document.getElementById("eventTitle").innerText = event.title;
        document.getElementById("eventMember").innerText = event.member || "-";
        document.getElementById("eventDateTime").innerText =
            `${event.date} · ${event.time}`;
        document.getElementById("eventLocation").innerText = event.location;
        document.getElementById("eventNotes").innerText = event.notes || "-";

        eventModal.classList.add("active");
    });
});

closeBtn.addEventListener("click", () => {
    eventModal.classList.remove("active");
});

const form = document.getElementById("eventForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const data = {
        societyId: localStorage.getItem('society_id'),
        type: "meeting", // later connect to toggle
        title: formData.get("title"),
        date: formData.get("date"),
        time: formData.get("time"),
        location: formData.get("location"),
        member: formData.get("member"),
        notes: formData.get("notes")
    };

    const res = await fetch("http://localhost:3000/api/events/create", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
         },
        
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert("Event added");
        location.reload();
    }
});

async function loadEvents() {
    const res = await fetch(`http://localhost:3000/api/events/${localStorage.getItem('society_id')}`,{
        headers: { 
            Authorization: `Bearer ${token}`
         }
    }); // societyId
    const events = await res.json();
    console.log(events)

    const container = document.querySelector(".events-list");
    container.innerHTML = "";

    if (events.length === 0) {
        container.innerHTML = "<p>No upcoming events</p>";
        return;
    }

    events.forEach(event => {
        container.innerHTML += `
        <div class="event-card" 
             data-event-id="${event.id}" 
             data-event-type="${event.type}">
            <div class="event-date">
                <div class="date-badge">
                    <span class="day">${new Date(event.date).getDate()}</span>
                    <span class="month">${new Date(event.date).toLocaleString('en', { month: 'short' }).toUpperCase()}</span>
                </div>
            </div>
            <div class="event-details">
                <h3>${event.title}</h3>
                <p>${event.time} · ${event.location}</p>
            </div>
        </div>`;
    });
}


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

//load society
async function loadSociety() {
    const res = await fetch(`http://localhost:3000/api/societies/society/${localStorage.getItem('society_id')}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await res.json();
    console.log(data)

    renderStats(data.total_contributions, data.total_claims, data.months_contributions)
    renderSociety(data.society, data.members);
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


    // ========== RENDER PAYMENT CARD ==============
    document.getElementById('society-name').value = s.society_name;
    document.getElementById('societyname').value = s.society_name;
    document.getElementById('amount').value = s.monthly_contribution
    document.getElementById('month').value = `${new Date().getFullYear()}-0${new Date().getMonth()}`
    document.getElementById('claim_amount').value = s.cover_amount
}
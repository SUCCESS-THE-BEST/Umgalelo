let selectedEventType = "meeting";
let allEvents = [];

window.onload = async () => {

    await initSocietyPage();
    await loadEvents();
    setupEventFilters();
};


document.querySelectorAll('.event-type-option').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.event-type-option')
            .forEach(b => b.classList.remove('active'));

        btn.classList.add('active');

        selectedEventType = btn.dataset.type;

        document.getElementById('eventTypeInput').value = selectedEventType;
    });
});

const eventModal = document.getElementById("eventDetailsModal");
const closeBtn = document.getElementById("closeEventDetails");

// ========== OPEN EVENT CARD ==========
async function openEventDetails(eventId) {

    const res = await fetch(
        `${API_BASE}/api/events/single/${eventId}`
    );

    const event = await res.json();

    document.getElementById("eventTitle").innerText = event.title;
    document.getElementById("eventMember").innerText = event.member || "-";
    document.getElementById("eventDateTime").innerText =
        `${event.date} · ${event.time}`;
    document.getElementById("eventLocation").innerText = event.location;
    document.getElementById("eventNotes").innerText = event.notes || "-";

    eventModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

closeBtn.addEventListener("click", () => {
    eventModal.classList.remove("active");
});

const form = document.getElementById("eventForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const data = {
        societyId: localStorage.getItem('society_id'),
        type: formData.get("type"),
        title: formData.get("title"),
        date: formData.get("date"),
        time: formData.get("time"),
        location: formData.get("location"),
        member: formData.get("member"),
        notes: formData.get("notes")
    };

    const res = await fetch(`${API_BASE}/api/events/create`, {
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

    const res = await fetch(
        `${API_BASE}/api/events/${localStorage.getItem('society_id')}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const events = await res.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    allEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);

        return eventDate >= today;
    });

    renderEvents(allEvents);
}

function renderEvents(events) {

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
                 data-event-type="${event.type}"
                 onclick="openEventDetails(${event.id})">

                <div class="event-date">
                    <div class="date-badge">
                        <span class="day">
                            ${new Date(event.date).getDate()}
                        </span>

                        <span class="month">
                            ${new Date(event.date)
                                .toLocaleString('en', { month: 'short' })
                                .toUpperCase()}
                        </span>
                    </div>
                </div>

                <div class="event-details">
                    <h3>
                        ${
                            event.type === 'funeral'
                            ? 'Funeral'
                            : 'Meeting'
                        } - ${event.title}
                    </h3>

                    <p>
                        ${event.time} · ${event.location}
                    </p>
                </div>
            </div>
        `;
    });
}

function setupEventFilters() {

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    filterButtons.forEach(btn => {

        btn.addEventListener("click", () => {

            filterButtons.forEach(b =>
                b.classList.remove("active")
            );

            btn.classList.add("active");

            const filter = btn.dataset.filter;

            if (filter === "all") {
                renderEvents(allEvents);
                return;
            }

            const filtered = allEvents.filter(event => {
                return event.type === filter;
            });

            renderEvents(filtered);
        });

    });
}
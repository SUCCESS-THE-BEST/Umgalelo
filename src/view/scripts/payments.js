
let allPayments = [];

window.onload = async () => {
    await initSocietyPage();

    await loadPayments();

    if (localStorage.getItem("role") !== "admin") {
        const btn = document.getElementById("sendRemindersBtn");
        if (btn) btn.style.display = "none";
    }
};

// =============== LOAD SOCIETY CONTRIBUTION / PAYMENT HISTORY ================
async function loadPayments() {

    try {
        const res = await fetch(`${API_BASE}/api/contributions/history/${societyId}`, {
            headers: {
            Authorization: `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        console.log(data)

        allPayments = data;

        renderPayments(allPayments);
    } catch (err) {
        console.error(err);
    }
}


// ================ RENDER CONTRIBUTIONS PAYMENTS ==============

function renderPayments(payments) {
    const tbody = document.querySelector(".payments-table tbody");
    tbody.innerHTML = "";

    // =============== IF NO PAYMENT HISTORY ==================
    if (payments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No payment history
                </td>
            </tr>
        `;
        return;
    }

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    payments.forEach(p => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="member-cell">
                    <div class="member-avatar">
                        ${p.first_name[0]}${p.last_name[0]}
                    </div>
                    <span>${p.first_name} ${p.last_name}</span>
                </div>
            </td>

            <td>
                ${p.payment_month || `${now.getFullYear()}-${month}`}
            </td>

            <td>
                ${p.amount != null ? `R${p.amount}` : '-'}
            </td>

            <td>
                <span class="status-badge ${
                    p.status === 'paid'
                    ? 'status-paid'
                    : 'status-due'
                }">
                    ${p.status === 'paid' ? 'paid' : 'due'}
                </span>
            </td>

            <td>
                ${
                    p.payment_date
                    ? new Date(p.payment_date).toLocaleDateString()
                    : "-"
                }
            </td>
        `;

        tbody.appendChild(row);
    });
}

document.getElementById('overview').addEventListener('click', (e) => {
    e.preventDefault()
  window.location.href = `society.html?id=${localStorage.getItem("society_id")}`;
})


// ================= SEND PAYMENT REMINDERS (ADMIN ONLY) =================
const sendRemindersBtn =
    document.getElementById('sendRemindersBtn');

    sendRemindersBtn.addEventListener('click', async () => {

    try {

        const societyId =
            localStorage.getItem('society_id');

        const res = await fetch(
            `${API_BASE}/api/contributions/reminders/${societyId}`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        alert(data.message);

    } catch (err) {

        console.error(err);
        alert('Error sending reminders');
    }
});


// ============== FILTER BUTTONS ================
const filterButtons = document.querySelectorAll(".filter-group button");

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        // =========== ACTIVE BUTTON STYLING ===============
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.textContent.trim();

        if (filter === "All Members") {
            renderPayments(allPayments);
        }

        if (filter === "Paid") {
            const paid = allPayments.filter(
                p => p.status === "paid"
            );

            renderPayments(paid);
        }

        if (filter === "Due") {
            const due = allPayments.filter(
                p => p.status !== "paid"
            );

            renderPayments(due);
        }
    });
});

const { jsPDF } = window.jspdf;
// const societyId = localStorage.getItem('society_id')

async function downloadContributionStatement() {

    try {

        // ================= FETCH DATA =================
        const paymentRes = await fetch(
            `${API_BASE}/api/contributions/history/${societyId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const payments = await paymentRes.json();

        const societyRes = await fetch(
            `${API_BASE}/api/societies/society/${societyId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const societyData = await societyRes.json();

        const profileRes = await fetch(
            `${API_BASE}/api/auth/profile`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const [user] = await profileRes.json();

        // ================= MEMBER PAYMENTS ONLY =================
        const myPayments = payments.filter(
            p =>
                p.first_name === user.first_name &&
                p.last_name === user.last_name
        );

        // ================= PDF =================
        const doc = new jsPDF();

        const society = societyData.society;

        // COLORS
        const primary = [88, 51, 31];
        const gray = [110, 110, 110];
        const lightGray = [245, 245, 245];

        // ================= HEADER =================
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(...primary);

        doc.text('UMGALELO', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(...gray);

        doc.text(
            'Burial Society Contribution Statement',
            14,
            30
        );

        // RIGHT SIDE
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);

        doc.text('STATEMENT', 145, 22);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const today = new Date();

        doc.text(
            `Statement Date: ${today.toLocaleDateString()}`,
            145,
            30
        );

        doc.text(
            `Statement #: UMG-${societyId}-${today.getFullYear()}`,
            145,
            36
        );

        // ================= DIVIDER =================
        doc.setDrawColor(180);
        doc.line(14, 45, 196, 45);

        // ================= MEMBER INFO =================
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);

        doc.text('MEMBER DETAILS', 14, 58);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);

        doc.text(
            `${user.first_name} ${user.last_name}`,
            14,
            67
        );

        doc.text(user.email, 14, 74);

        doc.text(
            `ID Number: ${user.id_number || 'N/A'}`,
            14,
            81
        );

        // ================= SOCIETY INFO =================
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);

        doc.text('SOCIETY DETAILS', 120, 58);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);

        doc.text(
            society.society_name,
            120,
            67
        );

        doc.text(
            `${society.city}, ${society.province}`,
            120,
            74
        );

        doc.text(
            `Monthly Contribution: R${society.monthly_contribution}`,
            120,
            81
        );

        doc.text(
            `Cover Amount: R${society.cover_amount}`,
            120,
            88
        );

        // ================= PAYMENT SUMMARY =================

        let totalPaid = 0;

        myPayments.forEach(p => {
            if (p.status === 'paid') {
                totalPaid += Number(p.amount || 0);
            }
        });

        // SUMMARY CONTAINER
        doc.setFillColor(248, 248, 248);
        doc.roundedRect(14, 98, 182, 28, 3, 3, 'F');

        // BOX DIVIDERS
        doc.setDrawColor(220);
        doc.line(74, 98, 74, 126);
        doc.line(134, 98, 134, 126);

        // LABELS
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...gray);

        doc.text('TOTAL PAID', 22, 108);
        doc.text('TRANSACTIONS', 84, 108);
        doc.text('STATUS', 148, 108);

        // VALUES
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);

        doc.text(`R${totalPaid.toFixed(2)}`, 22, 118);
        doc.text(`${myPayments.length}`, 84, 118);

        doc.setTextColor(40, 167, 69);
        doc.text('ACTIVE', 148, 118);

        // ================= CONTRIBUTION TABLE =================

        const tableColumn = [
            "Month",
            "Payment Date",
            "Description",
            "Status",
            "Amount"
        ];

        const tableRows = myPayments.map(p => [

            p.payment_month || '-',

            p.payment_date || '-',

            'Monthly Contribution',

            p.status,

            `R${Number(p.amount).toFixed(2)}`
        ]);

        doc.autoTable({

            startY: 138,

            head: [tableColumn],

            body: tableRows,

            theme: 'grid',

            styles: {
                font: 'helvetica',
                fontSize: 10,
                cellPadding: 4,
                valign: 'middle'
            },

            headStyles: {
                fillColor: primary,
                textColor: 255,
                fontStyle: 'bold'
            },

            alternateRowStyles: {
                fillColor: [248, 248, 248]
            },

            columnStyles: {
                4: {
                    halign: 'right'
                }
            },

            margin: {
                left: 14,
                right: 14
            }
        });

        // ================= TOTALS SECTION =================

        const finalY = doc.lastAutoTable.finalY + 12;

        doc.setDrawColor(220);
        doc.line(120, finalY, 196, finalY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...gray);

        doc.text('Total Contributions Paid:', 120, finalY + 10);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(40, 167, 69);

        doc.text(
            `R${totalPaid.toFixed(2)}`,
            170,
            finalY + 10
        );

        // ================= NOTES =================

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(130);

        doc.text(
            'This statement serves as proof of contribution history within the burial society.',
            14,
            finalY + 28
        );

        doc.text(
            'For any disputes or queries, please contact your society administrator.',
            14,
            finalY + 34
        );

        
        // ================= FOOTER =================
        doc.setDrawColor(200);
        doc.line(14, 280, 196, 280);

        doc.setFontSize(9);
        doc.setTextColor(120);

        doc.text(
            'Generated securely by Umgalelo',
            14,
            287
        );

        doc.text(
            `${today.toLocaleDateString()}`,
            170,
            287
        );

        // ================= SAVE =================
        doc.save(
            `${society.society_name}-statement.pdf`
        );

    } catch (err) {

        console.error(err);
        alert('Error generating statement');
    }
}


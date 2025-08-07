// 🔐 Admin access check
if (localStorage.getItem("isAdmin") !== "true") {
  alert("🚫 Unauthorized. Please log in as admin.");
  window.location.href = "login.html";
}

const container = document.getElementById("adminContainer");
const statsBox = document.getElementById("adminStats");
let allReports = [];

// 🚀 Fetch all reports from backend
function fetchReports() {
  fetch("https://exam-wsta.onrender.com")
    .then((res) => res.json())
    .then((data) => {
      allReports = data;
      renderStats(data);
      renderReports(data);
    })
    .catch((err) => {
      container.innerHTML = "❌ Failed to load reports.";
      statsBox.innerHTML = "";
    });
}

// 📊 Render stats box
function renderStats(data) {
  const total = data.length;
  const verified = data.filter(r => r.isVerified).length;
  const pending = total - verified;

  statsBox.innerHTML = `
    <div><strong>📊 Total Reports:</strong> ${total}</div>
    <div><strong>✅ Verified:</strong> ${verified}</div>
    <div><strong>❌ Pending:</strong> ${pending}</div>
    <hr/>
  `;
}

// 🧾 Render all reports
function renderReports(data) {
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = "No reports found.";
    return;
  }

  data.forEach((report) => {
    const div = document.createElement("div");
    div.className = "report" + (report.isVerified ? " verified" : "");

    div.innerHTML = `
      <input type="checkbox" class="reportCheckbox" value="${report._id}" />
      <h3>${report.examName} — ${report.centerName}</h3>
      <p>${report.description}</p>
      <small>🕒 ${new Date(report.timestamp).toLocaleString()}</small><br/>
      ${renderMedia(report.media)}<br/>
      <strong>Status:</strong> ${report.isVerified ? "✅ Verified" : "❌ Not Verified"}
      ${!report.isVerified ? `<br/><button onclick="verifyReport('${report._id}')">Verify ✅</button>` : ""}
      <br/><button onclick="deleteReport('${report._id}')">🗑️ Delete</button>
    `;

    container.appendChild(div);
  });
}

// 📷 Render media (image/video/other)
function renderMedia(fileName) {
  if (!fileName) return "";
  const ext = fileName.split(".").pop().toLowerCase();
  const url = `https://exam-wsta.onrender.com/uploads/${fileName}`;

  if (["jpg", "jpeg", "png"].includes(ext)) {
    return `<img src="${url}" alt="Media" />`;
  } else if (["mp4", "mov", "avi"].includes(ext)) {
    return `<video src="${url}" controls></video>`;
  } else {
    return `<a href="${url}" target="_blank">View media</a>`;
  }
}

// ✅ Verify a single report
function verifyReport(id) {
  if (!confirm("Verify this report?")) return;

  fetch(`https://exam-wsta.onrender.com/api/reports/verify/${id}`, { method: "PUT" })
    .then(() => fetchReports())
    .catch(() => alert("❌ Failed to verify."));
}

// ✅ Bulk verify
function verifySelectedReports() {
  const ids = [...document.querySelectorAll(".reportCheckbox:checked")].map(cb => cb.value);
  if (ids.length === 0) return alert("Select reports to verify.");

  ids.forEach(id => verifyReport(id));
}

// 🗑️ Delete a single report
function deleteReport(id) {
  if (!confirm("Are you sure to delete this report?")) return;

  fetch(`https://exam-wsta.onrender.com/api/reports/${id}`, { method: "DELETE" })
    .then(() => fetchReports())
    .catch(() => alert("❌ Failed to delete."));
}

// 🗑️ Bulk delete
function deleteSelectedReports() {
  const ids = [...document.querySelectorAll(".reportCheckbox:checked")].map(cb => cb.value);
  if (ids.length === 0) return alert("Select reports to delete.");
  if (!confirm("Are you sure to delete selected reports?")) return;

  ids.forEach(id => deleteReport(id));
}

// 🔍 Search function
function handleSearch(query) {
  const q = query.trim().toLowerCase();
  const filtered = allReports.filter((report) => {
    return (
      report.examName.toLowerCase().includes(q) ||
      report.centerName.toLowerCase().includes(q)
    );
  });
  renderReports(filtered);
}

// 🔘 Filter (verified, pending, all)
function filterReports(type) {
  if (type === "verified") {
    renderReports(allReports.filter(r => r.isVerified));
  } else if (type === "pending") {
    renderReports(allReports.filter(r => !r.isVerified));
  } else {
    renderReports(allReports);
  }
}

// 📄 Export PDF
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.text("EduGuard Reports", 14, 15);
  doc.setFontSize(10);

  allReports.forEach((r, i) => {
    doc.text(`Report #${i + 1}: ${r.examName} - ${r.centerName}`, 10, y);
    y += 6;
    doc.text(`Desc: ${r.description}`, 10, y); y += 6;
    doc.text(`Status: ${r.isVerified ? "✅ Verified" : "❌ Pending"}`, 10, y); y += 6;
    doc.text(`Time: ${new Date(r.timestamp).toLocaleString()}`, 10, y); y += 10;
    if (y > 270) { doc.addPage(); y = 20; }
  });

  doc.save("eduguard-reports.pdf");
}

// 📊 Export CSV
function downloadCSV() {
  const headers = ["Exam", "Center", "Description", "Status", "Timestamp"];
  const rows = allReports.map(r => [
    `"${r.examName}"`,
    `"${r.centerName}"`,
    `"${r.description}"`,
    r.isVerified ? "Verified" : "Pending",
    new Date(r.timestamp).toLocaleString()
  ]);

  let csvContent = "data:text/csv;charset=utf-8,"
    + headers.join(",") + "\n"
    + rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "eduguard-reports.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 🚪 Logout
function logout() {
  localStorage.removeItem("isAdmin");
  window.location.href = "login.html";
}

// ✅ Initial fetch
fetchReports();

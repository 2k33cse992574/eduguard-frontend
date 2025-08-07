const adminReportsContainer = document.getElementById("adminReportsContainer");

async function fetchVerifiedReports() {
  try {
    const res = await fetch("https://eduguard-backend.onrender.com/api/reports/verified");
    const data = await res.json();

    adminReportsContainer.innerHTML = "";

    if (data.length === 0) {
      adminReportsContainer.innerHTML = "<p>No verified reports available.</p>";
      return;
    }

    data.forEach((report) => {
      const card = document.createElement("div");
      card.classList.add("report-card");

      card.innerHTML = `
        <p><strong>📘 Exam:</strong> ${report.examName}</p>
        <p><strong>📍 Center:</strong> ${report.centerName}</p>
        <p><strong>📝 Description:</strong> ${report.description}</p>
        <p><strong>📸 Media:</strong> <a href="https://eduguard-backend.onrender.com/uploads/${report.media}" target="_blank">View File</a></p>
        <p><strong>🧠 Verified:</strong> ${report.verified ? "Yes" : "No"}</p>
        <p><strong>📅 Date:</strong> ${new Date(report.createdAt).toLocaleString()}</p>
      `;

      adminReportsContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching verified reports:", err);
    adminReportsContainer.innerHTML = "<p>❌ Failed to load verified reports.</p>";
  }
}

fetchVerifiedReports();

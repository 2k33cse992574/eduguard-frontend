const reportsContainer = document.getElementById("reports");
const searchInput = document.getElementById("searchInput");
const tagFilter = document.getElementById("tagFilter");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageNumberSpan = document.getElementById("pageNumber");

let currentPage = parseInt(localStorage.getItem("dashboardPage")) || 1;
let reports = [];

async function fetchReports() {
  try {
    reportsContainer.innerHTML = `<p>Loading...</p>`;
    const res = await fetch("https://exam-wsta.onrender.com/api/reports");
    const data = await res.json();
    reports = data.reverse(); // Show latest first
    applyFilters();
  } catch (error) {
    reportsContainer.innerHTML = `<p style="color:red;">Failed to load reports</p>`;
    console.error("Fetch error:", error);
  }
}

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedTag = tagFilter.value;

  let filtered = reports.filter((report) =>
    report.description.toLowerCase().includes(searchTerm)
  );

  if (selectedTag) {
    filtered = filtered.filter((r) => r.examName === selectedTag);
  }

  displayReports(filtered);
}

function displayReports(filtered) {
  const reportsPerPage = 5;
  const totalPages = Math.ceil(filtered.length / reportsPerPage);

  if (currentPage > totalPages) currentPage = totalPages || 1;

  const start = (currentPage - 1) * reportsPerPage;
  const end = start + reportsPerPage;
  const paginated = filtered.slice(start, end);

  pageNumberSpan.textContent = `Page ${currentPage}`;

  if (paginated.length === 0) {
    reportsContainer.innerHTML = `<p>No reports found.</p>`;
    return;
  }

  reportsContainer.innerHTML = paginated
    .map((report) => {
      const mediaLink = report.media
        ? `<p><a href="https://exam-wsta.onrender.com/uploads/${report.media}" target="_blank">📎 View Media</a></p>`
        : "";

      const tag = report.examName
        ? `<span class="tag-pill">${report.examName}</span>`
        : "";

      const verifyButton = report.verified
        ? `<p style="color: green;"><strong>✅ Verified</strong></p>`
        : `<button class="verify-btn" onclick="verifyReport('${report._id}')">Mark Verified</button>`;

      return `
        <div class="card">
          <h3>${report.centerName} ${tag}</h3>
          <p>${report.description}</p>
          ${mediaLink}
          <p><small>📍 IP: ${report.ip || "N/A"}</small></p>
          ${verifyButton}
        </div>
      `;
    })
    .join("");
}

async function verifyReport(id) {
  try {
    const res = await fetch(`https://exam-wsta.onrender.com/api/reports/${id}/verify`, {
      method: "PATCH",
    });

    if (res.ok) {
      alert("Report marked as verified!");
      fetchReports(); // Reload reports
    } else {
      alert("Failed to verify report.");
    }
  } catch (err) {
    console.error("Verification error:", err);
    alert("Network error.");
  }
}

// Event Listeners
searchInput.addEventListener("input", () => {
  currentPage = 1;
  localStorage.setItem("dashboardPage", currentPage);
  applyFilters();
});

tagFilter.addEventListener("change", () => {
  currentPage = 1;
  localStorage.setItem("dashboardPage", currentPage);
  applyFilters();
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    localStorage.setItem("dashboardPage", currentPage);
    applyFilters();
  }
});

nextPageBtn.addEventListener("click", () => {
  currentPage++;
  localStorage.setItem("dashboardPage", currentPage);
  applyFilters();
});

// Theme toggle if needed
const userPref = localStorage.getItem("theme");
if (userPref === "dark") {
  document.body.classList.add("dark");
}

// Init
fetchReports();

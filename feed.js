const feed = document.getElementById("feed");

let currentPage = 1;
let totalPages = 1;
let currentFilter = "ALL";

// Load saved filter from localStorage
document.addEventListener("DOMContentLoaded", () => {
  const savedFilter = localStorage.getItem("examFilter");
  if (savedFilter) {
    currentFilter = savedFilter;
  }
  fetchReports();
});

function filterByExam(exam) {
  currentFilter = exam;
  currentPage = 1;
  localStorage.setItem("examFilter", exam);
  fetchReports();
}

function clearFilters() {
  currentFilter = "ALL";
  localStorage.removeItem("examFilter");
  currentPage = 1;
  fetchReports();
}

async function fetchReports() {
  feed.innerHTML = "⏳ Loading...";
  try {
    const res = await fetch(
      `https://exam-wsta.onrender.com/api/reports/verified?page=${currentPage}&limit=6`
    );
    const data = await res.json();

    totalPages = data.totalPages;
    renderReports(data.reports);
  } catch (err) {
    feed.innerHTML = "❌ Failed to load feed.";
    console.error(err);
  }
}

function renderReports(reports) {
  feed.innerHTML = "";

  const filtered = currentFilter === "ALL"
    ? reports
    : reports.filter((r) => r.examName.toUpperCase() === currentFilter);

  if (filtered.length === 0) {
    feed.innerHTML = "<p>📭 No reports found for selected filter.</p>";
    return;
  }

  filtered.forEach((r) => {
    const card = document.createElement("div");
    card.className = "report-card";

    const tagClass =
      r.examName === "NEET"
        ? "tag-neet"
        : r.examName === "JEE"
        ? "tag-jee"
        : r.examName === "CUET"
        ? "tag-cuet"
        : "tag-other";

    card.innerHTML = `
      <span class="tag ${tagClass}">${r.examName}</span>
      <h3>${r.centerName}</h3>
      <p>${r.description}</p>
      ${r.media ? `<a href="https://exam-wsta.onrender.com/uploads/${r.media}" target="_blank">📎 View Media</a>` : ""}
      <p class="time">🕒 ${new Date(r.timestamp).toLocaleString()}</p>
    `;

    feed.appendChild(card);
  });

  renderPagination();
}

function renderPagination() {
  const pagination = document.createElement("div");
  pagination.className = "pagination";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.addEventListener("click", () => {
      currentPage = i;
      fetchReports();
    });
    pagination.appendChild(btn);
  }

  feed.appendChild(pagination);
}

const container = document.getElementById("feedContainer");
const countBar = document.getElementById("countBar");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");
const loader = document.getElementById("loader");
const darkToggle = document.getElementById("darkToggle");
const chartCtx = document.getElementById("centerChart");
let chartInstance = null;

let allReports = [];
let filteredReports = [];
let currentPage = 1;
const reportsPerPage = 5;
let currentUserIP = "";
let topCenters = [];

// 🌐 Dark mode memory
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
  darkToggle.checked = true;
}
darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", darkToggle.checked);
});

// Get IP
fetch("https://api.ipify.org?format=json")
  .then((res) => res.json())
  .then((data) => currentUserIP = data.ip);

// Fetch
loader.style.display = "block";
fetch("https://exam-wsta.onrender.com")
  .then((res) => res.json())
  .then((data) => {
    loader.style.display = "none";

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    allReports = data
      .filter(r => r.isVerified && new Date(r.timestamp) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .reverse();

    renderTagFilters();
    applySavedFilters();
    drawChart(allReports);
  })
  .catch(err => {
    loader.style.display = "none";
    container.innerHTML = "❌ Failed to load reports.";
    console.error(err);
  });

function drawChart(data) {
  const counts = {};
  data.forEach(r => {
    counts[r.centerName] = (counts[r.centerName] || 0) + 1;
  });

  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCtx, {
    type: "bar",
    data: {
      labels: top.map(([name]) => name),
      datasets: [{
        label: "Reports per Center",
        data: top.map(([_, count]) => count),
        backgroundColor: "#1e88e5",
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      }
    }
  });
}

function renderTagFilters() {
  const tags = ["NEET", "JEE", "CUET"];
  const wrapper = document.getElementById("tagFilters");
  wrapper.innerHTML = "";
  tags.forEach(tag => {
    const span = document.createElement("span");
    span.className = "tag-pill";
    span.textContent = tag;
    span.onclick = () => {
      searchInput.value = tag;
      localStorage.setItem("searchQuery", tag);
      applySavedFilters();
      highlightActiveTag(tag);
    };
    wrapper.appendChild(span);
  });
  highlightActiveTag(searchInput.value.trim());
}

function highlightActiveTag(tag) {
  document.querySelectorAll(".tag-pill").forEach(el => {
    el.classList.toggle("active", el.textContent === tag);
  });
}

function clearSearch() {
  searchInput.value = "";
  localStorage.removeItem("searchQuery");
  applySavedFilters();
}

function applySavedFilters() {
  const saved = localStorage.getItem("searchQuery") || "";
  searchInput.value = saved;
  handleSearch(saved);
}

function handleSearch(query) {
  const q = query.toLowerCase().trim();
  filteredReports = allReports.filter(r =>
    r.examName.toLowerCase().includes(q) ||
    r.centerName.toLowerCase().includes(q)
  );
  currentPage = 1;
  renderFeed();
}

function renderFeed() {
  container.innerHTML = "";
  const total = filteredReports.length;
  const start = (currentPage - 1) * reportsPerPage;
  const pageReports = filteredReports.slice(start, start + reportsPerPage);

  countBar.textContent = `Showing ${start + 1}–${Math.min(start + reportsPerPage, total)} of ${total} reports`;

  pageReports.forEach(r => {
    const timestamp = new Date(r.timestamp);
    const timeAgo = timeSince(timestamp);
    const isMine = r.ip === currentUserIP;
    const encodedText = encodeURIComponent(`🚨 ${r.examName} at ${r.centerName}\n${r.description}\n🕒 ${timestamp.toLocaleString()}`);
    const copyText = `🚨 ${r.examName} at ${r.centerName}\n${r.description}\n🕒 ${timestamp.toLocaleString()}`;

    const div = document.createElement("div");
    div.className = "report";
    div.innerHTML = `
      <h3>${r.examName} — ${r.centerName} ${isMine ? "🧍 Your IP" : ""}</h3>
      <p>${r.description}</p>
      <small>🕒 ${timestamp.toLocaleString()} (${timeAgo})</small><br/>
      ${renderMedia(r.media)}
      <br/><br/>
      <button onclick="copyToClipboard(\`${copyText.replace(/`/g, "\\`")}\`)">📋 Copy</button>
      <a href="https://wa.me/?text=${encodedText}" target="_blank"><button style="background:#25D366;color:white;">📲 WhatsApp</button></a>
      <a href="https://twitter.com/intent/tweet?text=${encodedText}" target="_blank"><button style="background:#1DA1F2;color:white;">🐦 Tweet</button></a>
    `;
    container.appendChild(div);
  });

  renderPagination();
}

function renderPagination() {
  pagination.innerHTML = "";
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.style.margin = "0 5px";
    btn.style.background = i === currentPage ? "#333" : "#ccc";
    btn.style.color = i === currentPage ? "#fff" : "#000";
    btn.onclick = () => {
      currentPage = i;
      renderFeed();
    };
    pagination.appendChild(btn);
  }
}

function renderMedia(fileName) {
  if (!fileName) return "";
  const ext = fileName.split(".").pop().toLowerCase();
  const url = `https://exam-wsta.onrender.com/uploads/${fileName}`;
  if (["jpg", "jpeg", "png"].includes(ext)) return `<img src="${url}" alt="Image" />`;
  if (["mp4", "mov"].includes(ext)) return `<video src="${url}" controls></video>`;
  return `<a href="${url}" target="_blank">View media</a>`;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("✅ Copied to clipboard!");
  });
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];
  for (let i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

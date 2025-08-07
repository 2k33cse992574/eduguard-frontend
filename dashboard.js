// frontend/dashboard.js

const container = document.getElementById("reportsContainer");

fetch("https://exam-wsta.onrender.com/api/reports")
  .then((res) => res.json())
  .then((data) => {
    if (data.length === 0) {
      container.innerHTML = "No reports found.";
      return;
    }

    container.innerHTML = "";
    data.forEach((report) => {
      const div = document.createElement("div");
      div.className = "report";

      div.innerHTML = `
        <h3>${report.examName} — ${report.centerName}</h3>
        <p>${report.description}</p>
        <small>🕒 ${new Date(report.timestamp).toLocaleString()}</small>
        ${report.media ? getMediaHTML(report.media) : ""}
      `;

      container.appendChild(div);
    });
  })
  .catch((err) => {
    console.error("Failed to load reports:", err);
    container.innerHTML = "Failed to load reports.";
  });

function getMediaHTML(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  const url = `https://exam-wsta.onrender.com/uploads/${filename}`;

  if (["jpg", "jpeg", "png"].includes(ext)) {
    return `<img src="${url}" alt="Report media" />`;
  } else if (["mp4", "mov", "avi"].includes(ext)) {
    return `<video src="${url}" controls></video>`;
  } else {
    return `<a href="${url}" target="_blank">View Media</a>`;
  }
}

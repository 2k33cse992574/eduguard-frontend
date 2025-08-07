// frontend/script.js

const form = document.getElementById("reportForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  try {
    const res = await fetch("https://exam-wsta.onrender.com/api/reports", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      message.textContent = "✅ Report submitted successfully!";
      message.style.color = "green";
      form.reset();
    } else {
      message.textContent = "❌ Failed to submit report.";
      message.style.color = "red";
    }
  } catch (err) {
    console.error("Error:", err);
    message.textContent = "❌ Network error.";
    message.style.color = "red";
  }
});

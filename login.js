const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "admin" && password === "exam2025") {
    localStorage.setItem("isAdmin", "true");
    window.location.href = "dashboard.html";
  } else {
    loginMessage.textContent = "❌ Invalid credentials.";
    loginMessage.style.color = "red";
  }
});

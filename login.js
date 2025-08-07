document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // Hardcoded credentials (you can upgrade later)
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "eduguard123";

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    localStorage.setItem("isAdmin", "true");
    window.location.href = "admin.html";
  } else {
    document.getElementById("error").innerText = "❌ Invalid credentials.";
  }
});

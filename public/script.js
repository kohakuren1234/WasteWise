const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});

function showRegister() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("registerSection").style.display = "block";
}

function showLogin() {
  document.getElementById("registerSection").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
}

function register() {
  const username = document.getElementById("regUser").value;
  const password = document.getElementById("regPass").value;

  fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("regMessage").textContent = data.message;
  });
}

function login() {
  const username = document.getElementById("logUser").value;
  const password = document.getElementById("logPass").value;

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("logMessage").textContent = data.message;

    if (data.success) {
      window.location.href = data.redirect; // redirect to dashboard
    }
  });
}

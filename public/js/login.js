const API_BASE_URL = window.location.origin;

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  const alert = document.getElementById("alert");

  // Get form values
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.textContent = "Signing In...";

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Store token and user data
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      showAlert("Login successful! Redirecting...", "success");

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 1000);
    } else {
      // Handle specific error cases
      if (
        response.status === 403 ||
        (data.message && data.message.toLowerCase().includes("verify"))
      ) {
        showAlert(
          "Please verify your email address before logging in. Check your inbox for the verification link.",
          "error"
        );
      } else if (response.status === 401) {
        showAlert("Invalid email or password. Please try again.", "error");
      } else {
        showAlert(
          data.message || "Login failed. Please check your credentials.",
          "error"
        );
      }
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }
  } catch (error) {
    console.error("Login error:", error);
    showAlert("An error occurred. Please try again later.", "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign In";
  }
});

function showAlert(message, type) {
  const alert = document.getElementById("alert");
  alert.textContent = message;
  alert.className = `alert ${type} show`;

  // Auto-hide error alerts after 5 seconds
  if (type === "error") {
    setTimeout(() => {
      alert.classList.remove("show");
    }, 5000);
  }
}

// Check if already logged in
if (localStorage.getItem("token")) {
  window.location.href = "/dashboard.html";
}

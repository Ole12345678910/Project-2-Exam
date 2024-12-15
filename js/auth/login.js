import { loginApi, fetchAndStoreCredits  } from "../modules/api.js";

// login.js
async function handleLogin(event) {
  event?.preventDefault(); // Only prevent default if the event is provided

  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    const loginResponse = await loginApi(email, password);

    const accessToken = loginResponse.data?.accessToken;
    const userName = loginResponse.data?.name;
    const userAvatar = loginResponse.data?.avatar?.url;

    if (!accessToken || !userName) {
      alert("Login failed. Missing required information.");
      return;
    }

    // Store login data in localStorage
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("email", email);
    localStorage.setItem("userName", userName);

    if (userAvatar) {
      localStorage.setItem("userAvatar", userAvatar);
    }
    alert("Login successful!");
    window.location.href = "/templates/index.html"; // Redirect after login
  } catch (error) {
    console.error("Login error:", error);

    // Show the specific error message from the API
    alert(error.message || "An unexpected error occurred. Please try again.");
  }
}

export { handleLogin }; // Export the handleLogin function

// Event listener for login form submission
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});

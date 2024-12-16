import { loginApi } from "../modules/api.js";

// Function to handle the login process
async function handleLogin(event) {
  event?.preventDefault(); // Prevent default form submission

  const email = document.getElementById("email")?.value.trim();  // Get email value
  const password = document.getElementById("password")?.value.trim(); // Get password value

  // If either email or password is missing, show an alert
  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    // Attempt to log in with email and password
    const loginResponse = await loginApi(email, password);

    const accessToken = loginResponse.data?.accessToken;
    const userName = loginResponse.data?.name;
    const userAvatar = loginResponse.data?.avatar?.url;

    // If login is missing necessary info, show an error
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

    alert("Login successful!"); // Show success message
    window.location.href = "/index.html"; // Redirect to homepage
  } catch (error) {
    console.error("Login error:", error);
    alert(error.message || "An unexpected error occurred.");
  }
}

// Export the login function
export { handleLogin };

// Add event listener for login form submission
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin); // Trigger handleLogin on submit
  }
});

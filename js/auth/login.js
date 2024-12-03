import { apiKey } from "../../constants/config.js";

const apiUrl = "https://v2.api.noroff.dev";  // Base API URL

// Function to handle login
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();  
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    const loginData = { email, password };

    try {
        const response = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Login failed:", errorData);
            alert(`Error: ${errorData.message || 'Login failed. Please try again.'}`);
            return;
        }

        const data = await response.json();
        console.log("Login successful:", data);

        const accessToken = data.data?.accessToken;
        const userName = data.data?.name;
        const userAvatar = data.data?.avatar?.url;

        if (!accessToken || !userName) {
            alert("Login response is missing required information. Please try again.");
            return;
        }

        // Store login data in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('email', email);
        localStorage.setItem('userName', userName);

        if (userAvatar) {
            localStorage.setItem('userAvatar', userAvatar);
        }

        // Fetch credits separately if not in login response
        await fetchAndStoreCredits(accessToken, userName);

        alert("Login successful!");
        window.location.href = "/templates/index.html"; // Redirect after successful login
    } catch (error) {
        console.error("Error during login:", error);
        alert(`An error occurred: ${error.message}`);
    }
}

// Function to fetch and store credits from the user's profile
async function fetchAndStoreCredits(accessToken, userName) {
    if (!accessToken || !userName) {
        console.error("Access token or username is missing.");
        return;
    }

    try {
        console.log(`Fetching profile for user: ${userName}`);
        const response = await fetch(`${apiUrl}/auction/profiles/${userName}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "X-Noroff-API-Key": apiKey, // Include if required
            },
        });

        if (response.status === 403) {
            console.error("Forbidden: Ensure the token has sufficient permissions.");
            alert("Access denied. Please contact support if you believe this is a mistake.");
            return;
        }

        if (!response.ok) {
            throw new Error(`Error fetching user profile. Status: ${response.status}`);
        }

        const profileData = await response.json();
        console.log("Profile data fetched:", profileData); // Debug log

        // Ensure credits are found in the profile response
        const userCredits = profileData?.data?.credits;

        if (userCredits !== undefined) {
            localStorage.setItem('userCredits', userCredits);
            console.log("User credits fetched and saved:", userCredits); // Debug log
        } else {
            console.warn("Credits not found in user profile response.");
        }
    } catch (error) {
        console.error("Error fetching credits:", error);
        alert("Failed to fetch user credits. Please check your connection or credentials.");
    }
}

// Event listener for login form submission
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error("Login form not found on the page.");
    }
});

// Optional: Add a helper function to update the UI after login (credits, avatar, etc.)
async function updateUserProfile() {
    const userName = localStorage.getItem('userName');
    const accessToken = localStorage.getItem('accessToken');

    if (!userName || !accessToken) {
        console.error("User not logged in.");
        return;
    }

    // Fetch and update user profile data (avatar, credits, etc.)
    try {
        const response = await fetch(`${apiUrl}/auction/profiles/${userName}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "X-Noroff-API-Key": apiKey,
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch user profile.");
            return;
        }

        const profileData = await response.json();
        const credits = profileData?.data?.credits;
        const avatarUrl = profileData?.data?.avatar?.url;

        if (credits !== undefined) {
            document.getElementById('credits-display').textContent = `Credits: ${credits}`;
            localStorage.setItem('userCredits', credits);
        }

        if (avatarUrl) {
            document.getElementById('avatar-display').src = avatarUrl;
            localStorage.setItem('userAvatar', avatarUrl);
        }
    } catch (error) {
        console.error("Error updating user profile:", error);
    }
}

// You can call `updateUserProfile()` after the page loads to display the user's credits and avatar

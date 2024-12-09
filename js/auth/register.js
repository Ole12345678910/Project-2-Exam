import { handleLogin } from "./login.js";
import { apiUrl } from "../constants/config.js";

// register.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent page refresh
    
        // Collect form data
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const bio = document.getElementById("bio").value;
        const avatarUrl = document.getElementById("avatar").value;
        const bannerUrl = document.getElementById("banner").value;
    
        // Validate required fields
        if (!name || !email || !password) {
            alert("Name, email, and password are required!");
            return;
        }

        // Validate password length (at least 8 characters)
        if (password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }
    
        // Validate URL lengths (max 300 characters)
        if (avatarUrl && avatarUrl.length > 300) {
            alert("Avatar URL cannot be greater than 300 characters.");
            return;
        }
        if (bannerUrl && bannerUrl.length > 300) {
            alert("Banner URL cannot be greater than 300 characters.");
            return;
        }
    
        // Prepare registration data
        const registerData = {
            name,
            email,
            password,
            bio: bio || undefined, // Optional bio
            avatar: avatarUrl ? { url: avatarUrl } : undefined, // Optional avatar
            banner: bannerUrl ? { url: bannerUrl } : undefined, // Optional banner
        };
    
        console.log("Register Data:", registerData); // Log data for debugging
    
        try {
            const response = await fetch(`${apiUrl}auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(registerData),
            });
    
            const data = await response.json(); // Get the response data
    
            if (response.ok) {
                alert("Registration successful! Logging you in now...");
                console.log("User registered:", data);
                
                // Now automatically log the user in
                // Call handleLogin function with the registered email and password
                await handleLogin({
                    preventDefault: () => {}, // Mimic the event.preventDefault() function
                });

                // Redirect to the logged-in page
                window.location.href = "/templates/index.html"; // or any other page you'd like to redirect to
            } else {
                console.error("Error response:", data); // Log the full error response
                handleErrors(data.errors || data.message);
                alert(`Registration failed: ${data.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("An error occurred. Please try again later.");
        }
    });
});

// Function to handle errors and show user-friendly messages
function handleErrors(errors) {
    if (typeof errors === 'string') {
        // Handle single message error
        const userFriendlyMessage = getUserFriendlyMessage(errors.toLowerCase());
        if (userFriendlyMessage) {
            alert(userFriendlyMessage);
        } else {
            console.error(`Error: ${errors}`);
        }
    } else if (Array.isArray(errors)) {
        // Handle array of errors
        errors.forEach((error) => {
            const errorMessage = error.message.toLowerCase(); // Normalize error message to handle case insensitivity
            console.log("Handling Error:", errorMessage); // Debug log for each error
            
            const userFriendlyMessage = getUserFriendlyMessage(errorMessage);
            if (userFriendlyMessage) {
                alert(userFriendlyMessage);
            } else {
                console.error(`Error: ${error.message}`); // Log any other error message
            }
        });
    }
}

// Function to map error messages to user-friendly messages
function getUserFriendlyMessage(errorMessage) {
    // Add mapping for specific error messages
    const errorMessages = {
        "profile already exists": "This profile (username or email) already exists. Please try another one.",
        "password too short": "Password must be at least 8 characters long."
    };
    
    for (const [key, message] of Object.entries(errorMessages)) {
        if (errorMessage.includes(key)) {
            return message;
        }
    }
    return null; // No matching error found
}

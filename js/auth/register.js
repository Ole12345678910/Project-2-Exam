import { handleLogin } from "./login.js";
import { apiUrl } from "../constants/config.js";

// Register form handling
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");

    // When the form is submitted
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent page reload
    
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

        // Validate password length
        if (password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }
    
        // Validate avatar and banner URLs
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
    
        console.log("Register Data:", registerData); // For debugging
    
        try {
            // Send registration request
            const response = await fetch(`${apiUrl}auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(registerData),
            });
    
            const data = await response.json(); // Get the response data
    
            if (response.ok) {
                alert("Registration successful! Logging you in...");
                console.log("User registered:", data);
                
                // Automatically log the user in after registration
                await handleLogin({
                    preventDefault: () => {}, // Mock preventDefault
                });

                // Redirect to the homepage
                window.location.href = "/index.html";
            } else {
                console.error("Error response:", data); // Log error response
                handleErrors(data.errors || data.message); // Handle specific errors
                alert(`Registration failed: ${data.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("An error occurred. Please try again later.");
        }
    });
});

// Function to handle specific errors and display messages
function handleErrors(errors) {
    if (typeof errors === 'string') {
        const userFriendlyMessage = getUserFriendlyMessage(errors.toLowerCase());
        if (userFriendlyMessage) {
            alert(userFriendlyMessage);
        } else {
            console.error(`Error: ${errors}`);
        }
    } else if (Array.isArray(errors)) {
        errors.forEach((error) => {
            const errorMessage = error.message.toLowerCase();
            console.log("Handling Error:", errorMessage);
            
            const userFriendlyMessage = getUserFriendlyMessage(errorMessage);
            if (userFriendlyMessage) {
                alert(userFriendlyMessage);
            } else {
                console.error(`Error: ${error.message}`);
            }
        });
    }
}

// Function to map error messages to user-friendly messages
function getUserFriendlyMessage(errorMessage) {
    const errorMessages = {
        "profile already exists": "This profile already exists. Please try another one.",
        "password too short": "Password must be at least 8 characters long."
    };
    
    for (const [key, message] of Object.entries(errorMessages)) {
        if (errorMessage.includes(key)) {
            return message;
        }
    }
    return null;
}

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
            const response = await fetch(`${apiUrl}auth/register`, { // Ensure the URL is correctly formatted
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(registerData),
            });
    
            const data = await response.json(); // Get the response data
    
            if (response.ok) {
                alert("Registration successful! You can now log in.");
                console.log("User registered:", data);
                window.location.href = "/templates/auth/login.html";
            } else {
                console.error("Full error response:", data); // Log the full error response
                if (data.errors) {
                    data.errors.forEach((error) => {
                        // Check for specific error
                        if (error.message.includes("already exists")) {
                            alert("This email is already in use. Please try another one.");
                        } else {
                            console.error(`Error: ${error.message}`); // Log each error message
                        }
                    });
                }
                alert(`Registration failed: ${data.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("An error occurred. Please try again later.");
        }
    });
    
    
    
    
});

// api.js
export async function registerUser(registerData) {

    try {
        // Make the POST request to the register endpoint
        const response = await fetch(`${apiUrl}auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(registerData),
        });
  
        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            const errorData = await response.json();
            return { success: false, message: errorData.message || "Unknown error" };
        }
    } catch (error) {
        console.error("Error during registration:", error);
        return { success: false, message: "An error occurred. Please try again later." };
    }
  }
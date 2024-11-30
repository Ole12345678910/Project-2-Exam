document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "https://v2.api.noroff.dev"; // Replace with your API base URL
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

        // Prepare registration data
        const registerData = {
            name,
            email,
            password,
            bio: bio || undefined, // Optional bio
            avatar: avatarUrl ? { url: avatarUrl } : undefined, // Optional avatar
            banner: bannerUrl ? { url: bannerUrl } : undefined, // Optional banner
        };

        try {
            // Make the POST request to register endpoint
            const response = await fetch(`${apiUrl}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(registerData),
            });

            if (response.ok) {
                const data = await response.json();
                alert("Registration successful! You can now log in.");
                console.log("User registered:", data);

                // Optionally redirect to the login page
                window.location.href = "/templates/auth/login.html";
            } else {
                const errorData = await response.json();
                alert(`Registration failed: ${errorData.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("An error occurred. Please try again later.");
        }
    });
});

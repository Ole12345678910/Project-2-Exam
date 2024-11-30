const apiUrl = "https://v2.api.noroff.dev";  // Ensure this is the correct API URL

// Function to handle login
async function handleLogin(event) {
    event.preventDefault(); // Prevent form submission refresh

    const email = document.getElementById('email').value;  // Get email from input
    const password = document.getElementById('password').value;  // Get password from input

    // Check if email and password are provided
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    const loginData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch(`${apiUrl}/auth/login`, {  // Correct URL
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Login successful:", data);

            // Extract details from the response
            const accessToken = data.data?.accessToken;  // Ensure token is extracted properly
            const userName = data.data?.name;  // Extract the user's name from the response
            const userAvatar = data.data?.avatar?.url; // Extract avatar URL if available

            if (accessToken && userName) {
                // Store the access token, email, and user details in localStorage
                localStorage.setItem('accessToken', accessToken); // Save token
                localStorage.setItem('email', email); // Save email
                localStorage.setItem('userName', userName); // Save user's name

                if (userAvatar) {
                    localStorage.setItem('userAvatar', userAvatar); // Save avatar URL if available
                }

                // Check if "remember me" is checked and store that preference
                if (document.getElementById('remember').checked) {
                    localStorage.setItem('rememberMe', true);
                } else {
                    localStorage.removeItem('rememberMe');
                }

                alert("Login successful!");

                // Redirect to home page after successful login
                window.location.href = "/templates/index.html"; // Change to actual home path
            } else {
                alert("Token or username missing in response. Please check the API.");
            }
        } else {
            // Log the full response for debugging purposes
            const errorData = await response.json();
            console.error("Login failed: ", errorData);  // Log the error details
            alert(`Error: ${errorData.message || 'Login failed. Please check credentials and try again.'}`);
        }
    } catch (error) {
        console.error("Error logging in:", error);  // Log any unexpected errors
        alert(`There was an error logging in: ${error.message || error}`);
    }
}

// Attach the event listener to the form on DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
});

// Function to handle Sign In / Log Out button visibility
export function handleAuthButtons() {
    const signInButtons = document.querySelectorAll('.sign-in-btn');  // Get all Sign In buttons
    const logOutButtons = document.querySelectorAll('.log-out-btn');  // Get all Log Out buttons

    const accessToken = localStorage.getItem('accessToken');  // Check if there's a stored access token

    if (accessToken) {
        // If logged in, hide Sign In buttons and show Log Out buttons
        signInButtons.forEach(button => button.classList.add('hidden'));
        logOutButtons.forEach(button => button.classList.remove('hidden'));
    } else {
        // If not logged in, show Sign In buttons and hide Log Out buttons
        signInButtons.forEach(button => button.classList.remove('hidden'));
        logOutButtons.forEach(button => button.classList.add('hidden'));
    }

    // Add click event for Log Out buttons
    logOutButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();  // Prevent default button action

            // Clear user data from localStorage on logout
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userName');
            localStorage.removeItem('apiKey');
            localStorage.removeItem('userAvatar');
            localStorage.removeItem('email');
            localStorage.removeItem('userCredits');
            localStorage.removeItem('avatarUrl');
            localStorage.removeItem('banner');
            localStorage.removeItem('bio');
            localStorage.removeItem('avatar');
            localStorage.removeItem('userBanner');

            console.log('Logged out. Current localStorage:', localStorage);

            // Hide Log Out buttons and show Sign In buttons after logout
            signInButtons.forEach(button => button.classList.remove('hidden'));
            logOutButtons.forEach(button => button.classList.add('hidden'));

            // Redirect to home or login page
            window.location.href = '/index.html';
        });
    });
}

// Call the function once the page has loaded
document.addEventListener('DOMContentLoaded', function() {
    handleAuthButtons();
});

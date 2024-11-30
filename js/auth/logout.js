document.addEventListener('DOMContentLoaded', function() {
    // Get all "Sign In" and "Log Out" buttons using classes
    const signInButtons = document.querySelectorAll('.sign-in-btn');
    const logOutButtons = document.querySelectorAll('.log-out-btn');

    // Get the accessToken from localStorage to check if the user is logged in
    const accessToken = localStorage.getItem('accessToken');

    // Check if accessToken exists
    if (accessToken) {
        // User is logged in, hide all "Sign In" buttons and show all "Log Out" buttons
        signInButtons.forEach(button => button.classList.add('hidden'));
        logOutButtons.forEach(button => button.classList.remove('hidden'));
    } else {
        // User is not logged in, show all "Sign In" buttons and hide all "Log Out" buttons
        signInButtons.forEach(button => button.classList.remove('hidden'));
        logOutButtons.forEach(button => button.classList.add('hidden'));
    }

    // Add event listener for "Log Out" buttons
    logOutButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default link behavior

            // Clear the accessToken, userName, and apiKey from localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userName');  // Clear userName from localStorage
            localStorage.removeItem('apiKey');    // Clear apiKey from localStorage
            localStorage.removeItem('userAvatar');
            localStorage.removeItem('email');
            localStorage.removeItem('userCredits');

            // Log the localStorage state to confirm it's cleared
            console.log('Logged out. Current localStorage:', localStorage);

            // Update the UI: hide all "Log Out" buttons and show all "Sign In" buttons
            signInButtons.forEach(button => button.classList.remove('hidden'));
            logOutButtons.forEach(button => button.classList.add('hidden'));

            // Redirect to home page or login page, or reload to ensure the localStorage is cleared
            window.location.href = '/templates/index.html';  // Make sure to update this URL correctly
        });
    });
});

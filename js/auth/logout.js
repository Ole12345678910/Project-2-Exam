// Function to handle authentication buttons (Sign In / Log Out)
export function handleAuthButtons() {
    const signInButtons = document.querySelectorAll('.sign-in-btn');
    const logOutButtons = document.querySelectorAll('.log-out-btn');

    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
        signInButtons.forEach(button => button.classList.add('hidden'));
        logOutButtons.forEach(button => button.classList.remove('hidden'));
    } else {
        signInButtons.forEach(button => button.classList.remove('hidden'));
        logOutButtons.forEach(button => button.classList.add('hidden'));
    }

    logOutButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();

            // Clear localStorage when logging out
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

            // Hide Log Out buttons and show Sign In buttons
            signInButtons.forEach(button => button.classList.remove('hidden'));
            logOutButtons.forEach(button => button.classList.add('hidden'));

            // Redirect to home page or login page
            window.location.href = '/templates/index.html';
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    handleAuthButtons(); // Call the function after the page has loaded
});

# Project-2-Exam

```
├── index.html               // Main HTML file (entry point for the website)
├── .gitignore               // Specifies files and directories for Git to ignore
├── package.json             // Project metadata and dependency manager
├── package-lock.json        // Locks specific versions of dependencies
├── postcss.config.js        // Configuration for PostCSS (CSS processing)
├── tailwind.config.js       // Configuration for Tailwind CSS
├── README.md                // Project documentation
├── assets/                  // Static assets
│   └── logo.svg             // Website logo in SVG format
├── css/                     // Stylesheets
│   └── style.css            // Main stylesheet
│   └── dist/                // Compiled CSS output
│       └── style.css        // Output of the build process
├── js/                      // JavaScript logic
│   ├── auth/                // Authentication logic
│   │   ├── login.js         // Handles user login
│   │   ├── logout.js        // Handles user logout
│   │   └── register.js      // Handles user registration
│   ├── constants/           // Configuration and constants
│   │   └── config.js        // App configuration variables
│   ├── modules/             // Reusable modules
│   │   ├── api.js           // API interactions
│   │   ├── search.js        // Search functionality
│   │   └── utility.js       // Utility functions
│   ├── pages/               // Page-specific logic
│   │   ├── details.js       // Details page logic
│   │   └── listings.js      // Listings page logic
│   └── user/                // User-specific logic
│       └── profile.js       // Profile page logic
├── templates/               // HTML templates
│   ├── auth/                // Authentication templates
│   │   ├── login.html       // Login page template
│   │   └── register.html    // Registration page template
│   ├── posts/               // Post-related templates
│   │   ├── details.html     // Details page template
│   │   └── user/            // User-specific templates
│   │       └── profile.html // Profile page template
```

## Installation and Setup

Follow these steps to install and run the project on your local machine:

### Prerequisites
- Install [Node.js](https://nodejs.org/) (includes npm).
- Install a code editor like [Visual Studio Code](https://code.visualstudio.com/).

### Steps
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install Dependencies**:
   Run the following command to install the required npm packages:
   ```bash
   npm install
   ```

3. **Install Concurrently**:
   Concurrently allows you to run multiple scripts in parallel (e.g., watch and live server):
   ```bash
   npm install concurrently --save-dev
   ```

4. **Run the Development Environment**:
   Use the `dev` script to run both Tailwind CSS watch mode and Live Server simultaneously:
   ```bash
   npm run dev
   ```

### Scripts
- **`npm run build`**: Compiles CSS into `dist/style.css`.
- **`npm run watch`**: Watches for changes in `css/style.css` and recompiles CSS in real-time.
- **`npm run serve`**: Starts Live Server for the project.
- **`npm run dev`**: Runs both `watch` and `serve` scripts concurrently.

### Workflow
- **Edit your CSS** in `css/style.css`. Tailwind CSS automatically updates the `dist/style.css` file.
- **Open the project** in the browser with Live Server.
- **Make changes** to HTML, JavaScript, or CSS files, and see them reflected live.

## Notes
- Ensure all changes to JavaScript modules and CSS files are reflected appropriately in the final build.
- Use `.gitignore` to exclude unnecessary files or folders from version control.



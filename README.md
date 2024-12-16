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
│   ├── style.css            // Main stylesheet
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

## Workflow
- Modify `style.css` for styling, then run the build process to update the `dist/style.css` file.
- Use the `js/` folder to implement functionality for different features and pages.
- Update the `templates/` folder for changes in UI design and layout.

## Notes
- Ensure all changes to JavaScript modules and CSS files are reflected appropriately in the final build.
- Use `.gitignore` to exclude unnecessary files or folders from version control.


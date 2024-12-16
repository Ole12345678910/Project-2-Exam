module.exports = {
  content: [
    './**/*.html',            // Look through all HTML files
    './**/*.js',              // Look through all JS files
    '!./node_modules/**/*',   // Exclude node_modules directory
], // Ensure TailwindCSS purges unused styles by looking through all HTML and JS files
  theme: {
    extend: {
      fontSize: {
        'clamped': 'clamp(0.875rem, 2.5vw, 1.25rem)', // Defining a custom class
      },
      colors: {
        "RoyalBlue": "#2563EB", 
        "White": "#FFFFFF",
        "Gallery": "#EFEFEF",
        "PersianBlue": "#1931bd",
        "Boulder": "#7B7B7B",
        "AlizarinCrimson": "#DC2626",
        "MountainMeadow": "#22C55E",
        "WestSide": "#fc8c14",
        "Sun": "#FAB615",
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Inter font family
        Graduate: ['Graduate', 'serif'], // Graduate font family
      },
      fontSize: {
        'xxs': '0.5rem',  // Custom size smaller than xs
        'md': '1rem',     // Custom medium size (optional, if you need text-md)
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      addUtilities({
        ".header": {
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "100vh", 
        },
        '.font-logo': {
          fontFamily: "Karantina, system-ui",
          fontWeight: '400',
          fontStyle: 'normal',
        },
        // Custom class for Inter Semi Bold
        '.font-button': {
          fontFamily: 'Inter, sans-serif',
          fontWeight: '600',
          fontStyle: 'normal',
        },
        // Custom class for Inter Regular
        '.font-body': {
          fontFamily: 'Inter, sans-serif',
          fontWeight: '400',
          fontStyle: 'normal',
        },
      });
    },
  ],
};

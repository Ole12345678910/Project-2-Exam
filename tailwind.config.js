module.exports = {
  content: [
    './**/*.html',    // Ensure all HTML files are included
    './**/*.js',      // Ensure all JS files are included
    './**/*.jsx',     // If you're using React or JSX files
  ],
  theme: {
    extend: {
      colors: {
        "RoyalBlue": "#2563EB", 
        "White": "#FFFFFF",
        "Gallery": "#EFEFEF",
        "PersianBlue": "#1931bd",
        "Boulder": "#7B7B7B",
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
        '.button-box': {
          padding: '0.375rem 1rem', // Equivalent to py-1.5 and px-4
          margin: '0.5rem',         // Equivalent to m-2
          backgroundColor: '#4169E1', // RoyalBlue
          color: '#ffffff',        // White text
          fontFamily: '"Open Sans", sans-serif',
          fontSize: '0.875rem',    // Equivalent to text-sm
          fontWeight: '500',       // Adjust if needed
        },
      });
    },
  ],
};

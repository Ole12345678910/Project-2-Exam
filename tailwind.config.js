module.exports = {
  content: ["./**/*.html", "./**/*.js"], // Ensure TailwindCSS purges unused styles by looking through all HTML and JS files
  theme: {
    extend: {
      colors: {
        "Amethyst": "#7E5BEF",
        "Lavender": "#A994ED",
        "SkyBlue": "#1FB6FF", //Bright Sky Blue
        "White": "#FFFFFF",
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Inter font family
      },
      fontSize:{
        'xxs': '0.5rem',  // Custom size smaller than xs
      }
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
        '.font-main': {
          fontFamily: 'Inter, sans-serif',
          fontWeight: '800',
          fontStyle: 'italic',
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

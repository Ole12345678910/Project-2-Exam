module.exports = {
  content: ["./**/*.html", "./**/*.js"], // Ensure TailwindCSS purges unused styles by looking through all HTML and JS files
  theme: {
    extend: {
      colors: {
        "Amethyst": "#7E5BEF",
        "Lavender": "#A994ED",
        "Bright Sky Blue": "#1FB6FF",
        "White": "#FFFFFF",
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Inter font family
      },
      fontWeight: {
        extraBold: '800', // Inter Extra Bold
        semiBold: '600',  // Inter Semi Bold
        regular: '400',   // Inter Regular
      },
      fontStyle: {
        italic: 'italic', // Add italic style (to support extra bold italic)
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
      });
    },
  ],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      spacing: {
        '90': '90vh',
        '80': '80vh',
        '70': '70vh',
        '60': '60vh',
        '50': '50vh',
        '40': '40vh',
        '30': '30vh',
        '20': '20vh',
        '50w': '50vw',
        '60w': '60vw',
        '70w': '70vw',
        '90w': '90vw',
        '80w': '80vw',
        '40w': '40vw',
        '30w': '30vw',
        '20w': '20vw',
      },
      boxShadow: {
        'thicc': '-4px 4px 0px 0px rgba(0, 0, 0, 0.3)',
      },
    },
    
  },
  plugins: [require("tailwindcss-animate")],
};

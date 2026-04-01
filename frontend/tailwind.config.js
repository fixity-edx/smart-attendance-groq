/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "10px 10px 30px rgba(15, 23, 42, 0.65), -10px -10px 30px rgba(255,255,255,0.04)",
        softin: "inset 10px 10px 30px rgba(15,23,42,.6), inset -10px -10px 30px rgba(255,255,255,0.04)"
      },
      borderRadius: {
        panel: "28px"
      }
    },
  },
  plugins: [],
}

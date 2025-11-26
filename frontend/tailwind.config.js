// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}","./frontend/components/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      colors: {
        sidebar: "#000000",       // dark black for Instagram-like sidebar
        sidebarHover: "#111111",  // slightly lighter on hover
        bubbleMe: "#833AB4",      // deep Instagram purple
        bubbleOther: "#FD1D1D"    // pink/red like Instagram gradient
      },
      backgroundImage: {
        "chat-gradient":
          "linear-gradient(135deg, rgba(131,58,180,0.12) 0%, rgba(253,29,29,0.12) 50%, rgba(252,176,69,0.12) 100%)",
        "sidebar-gradient":
          "linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.95) 100%)"
      }
    }
  },
  plugins: []
}

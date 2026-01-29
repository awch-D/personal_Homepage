/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": "#38ff14",
                "cyber-lime": "#38ff14",
                "deep-sea": "#0a192f",
                "background-light": "#f7f7f7",
                "background-dark": "#121212",
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"],
                "mono": ["Space Mono", "monospace"], // Fallback if needed
            },
        },
    },
    plugins: [],
}

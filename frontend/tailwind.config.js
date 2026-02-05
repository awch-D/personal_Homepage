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
                "primary": "#59f20d", // Updated to match design HTML
                "cyber-lime": "#59f20d",
                "cyber-blue": "#00f3ff", // Added from design
                "obsidian": "#0c0f0a", // Added from design
                "background-dark": "#0c0f0a", // Matched obsidian
                "terminal-border": "rgba(89, 242, 13, 0.2)", // Helper for borders
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"],
                "mono": ["Space Mono", "monospace"],
            },
            backgroundImage: {
                'grid-pattern': "radial-gradient(circle at 2px 2px, rgba(89, 242, 13, 0.05) 1px, transparent 0)",
            }
        },
    },
    plugins: [],
}

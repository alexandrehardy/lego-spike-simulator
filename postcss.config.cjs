// eslint-disable-next-line @typescript-eslint/no-require-imports
const tailwindcss = require('tailwindcss');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const autoprefixer = require('autoprefixer');

const config = {
    plugins: [tailwindcss(), autoprefixer]
};

module.exports = config;

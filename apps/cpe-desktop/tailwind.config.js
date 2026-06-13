import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/exam-desktop/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic palette used by shared @miuprep/exam-desktop components
        accent: colors.emerald,
        accentdeep: colors.emerald,
        accentalt: colors.teal,
        accentcontrast: colors.indigo,
      },
    },
  },
  plugins: [],
};

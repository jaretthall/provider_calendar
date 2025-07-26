/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./types/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Clínica Médicos Brand Colors
        clinica: {
          crimson: '#D91A55',    // Deep magenta-red (Pantone 200C)
          scarlet: '#E63946',    // Bright red (Pantone 179C)
          vermillion: '#F77F00', // Orange-red (Pantone 172C)
          orange: '#FCBF49',     // Bright orange (Pantone 1495C)
          amber: '#FFD60A',      // Golden orange (Pantone 1365C)
          gold: '#FFE066',       // Golden yellow (Pantone 136C)
          yellow: '#FFEE32',     // Bright yellow (Pantone 114C)
          teal: '#2A9D8F',       // Complementary teal
          darkTeal: '#264653',   // Dark teal
        },
        primary: {
          50: '#fef2f2',
          100: '#fee2e2', 
          200: '#fbcfe8',
          300: '#f472b6',
          400: '#ec4899',
          500: '#D91A55', // Brand crimson
          600: '#be185d',
          700: '#9d174d',
          800: '#831843',
          900: '#701a75',
        },
        success: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#2A9D8F', // Brand teal
          600: '#0d9488',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#FCBF49', // Brand orange
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#D91A55', // Brand crimson
          600: '#dc2626',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
  // Ensure all classes are generated for production
  safelist: [
    // Clínica Brand Colors
    'bg-clinica-crimson',
    'bg-clinica-scarlet', 
    'bg-clinica-vermillion',
    'bg-clinica-orange',
    'bg-clinica-amber',
    'bg-clinica-gold',
    'bg-clinica-yellow',
    'bg-clinica-teal',
    'bg-clinica-darkTeal',
    'text-clinica-crimson',
    'text-clinica-scarlet',
    'text-clinica-vermillion',
    'text-clinica-orange',
    'text-clinica-amber',
    'text-clinica-gold',
    'text-clinica-yellow',
    'text-clinica-teal',
    'text-clinica-darkTeal',
    'bg-gray-100',
    'bg-gray-200',
    'bg-gray-300',
    'bg-gray-400',
    'bg-gray-500',
    'bg-gray-600',
    'bg-gray-700',
    'bg-gray-800',
    'bg-gray-900',
    'text-gray-100',
    'text-gray-200',
    'text-gray-300',
    'text-gray-400',
    'text-gray-500',
    'text-gray-600',
    'text-gray-700',
    'text-gray-800',
    'text-gray-900',
    'text-white',
    'text-black',
    'border-gray-200',
    'border-gray-300',
    'border-gray-400',
    'border-gray-500',
    'bg-white',
    'bg-blue-50',
    'bg-blue-100',
    'bg-blue-500',
    'bg-blue-600',
    'bg-green-50',
    'bg-green-100',
    'bg-green-500',
    'bg-red-50',
    'bg-red-100',
    'bg-red-500',
    'bg-yellow-50',
    'bg-yellow-100',
    'bg-yellow-500',
    'text-blue-600',
    'text-green-600',
    'text-red-600',
    'text-yellow-600',
    'hover:bg-gray-50',
    'hover:bg-gray-100',
    'hover:bg-blue-600',
    'hover:bg-green-600',
    'hover:bg-red-600',
    'focus:ring-blue-500',
    'focus:border-blue-500',
    'rounded',
    'rounded-md',
    'rounded-lg',
    'shadow',
    'shadow-md',
    'shadow-lg',
    'p-2',
    'p-3',
    'p-4',
    'px-2',
    'px-3',
    'px-4',
    'py-1',
    'py-2',
    'py-3',
    'm-2',
    'm-4',
    'mb-2',
    'mb-4',
    'mt-2',
    'mt-4',
    'w-full',
    'w-auto',
    'h-full',
    'h-auto',
    'flex',
    'flex-col',
    'flex-row',
    'items-center',
    'justify-center',
    'justify-between',
    'space-x-2',
    'space-x-4',
    'space-y-2',
    'space-y-4'
  ]
} 
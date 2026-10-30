/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial FORMA
        ink: '#171717',       // Fondo base, texto oscuro
        accent: '#D19650',    // Dorado: CTAs, focos, acentos
        danger: '#661521',    // Vinotinto: Errores, botones de peligro
        surface: '#734F46',   // Café: Tarjetas, paneles secundarios
        cream: '#E7DED2',     // Crema: Textos claros, botones

        // Variantes semánticas de estado (usando los colores oficiales)
        success: '#6B7A4F',   // Verde oliva apagado (para pedidos "Listos" o "Pagados")
        warning: '#D19650',   // Usamos el dorado como advertencia
        info: '#734F46',      // Usamos el café para información neutra
      },
      fontFamily: {
        // Tipografía propuesta: Serif para títulos, Sans para el resto
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        // Bordes redondeados sutiles para el estilo premium
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
      },
      // Opcional: Para que el foco (focus) de los inputs sea visible con el dorado
      ringColor: {
        DEFAULT: '#D19650',
      }
    },
  },
  plugins: [],
}
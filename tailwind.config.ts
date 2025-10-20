
import type { Config } from 'tailwindcss'
export default {
  darkMode: ['class'],
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:'#ffe9ea',100:'#ffd3d5',200:'#ffabad',300:'#ff7b7f',400:'#ff5a5f',500:'#ff3b43',600:'#e22a32',700:'#bf2229',800:'#991b22',900:'#7b171d'
        }
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.35)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
} satisfies Config

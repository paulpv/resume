import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'

function getModifiedTime(path: string): Date {
  return fs.statSync(path).mtime
}

const resumeJsonModifiedTime = getModifiedTime('./public/resume.json')
const appModifiedTime = getModifiedTime('./src/App.tsx')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  define: {
    APP_MODIFIED_TIMESTAMP: JSON.stringify(appModifiedTime),
    RESUME_MODIFIED_TIMESTAMP: JSON.stringify(resumeJsonModifiedTime),
  },  
})

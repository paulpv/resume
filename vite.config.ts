import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'

function getModifiedTime(path: string): Date {
  return fs.statSync(path).mtime
}

function timeToYYYYMMDDHHSS(time: Date): string {
  const pad = (num: number) => num.toString().padStart(2, '0')
  return `${time.getFullYear()}/${pad(time.getMonth() + 1)}/${pad(time.getDate())} ${pad(time.getHours())}:${pad(time.getSeconds())}`
}

function getModifiedTimeString(path: string): string {
  return timeToYYYYMMDDHHSS(getModifiedTime(path))
}

const resumeJsonModifiedTimeString = getModifiedTimeString('./public/resume.json')
const appModifiedTimeString = getModifiedTimeString('./src/App.tsx')

// https://vite.dev/config/
export default defineConfig({
  base: '/resume/',
  plugins: [
    tailwindcss(),
    react(),
  ],
  define: {
    APP_MODIFIED_TIMESTAMP: JSON.stringify(appModifiedTimeString),
    RESUME_MODIFIED_TIMESTAMP: JSON.stringify(resumeJsonModifiedTimeString),
  },  
})

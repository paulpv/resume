import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import { execSync } from 'child_process'

function getModifiedTime(path: string): Date {
  try {
    return new Date(parseInt(execSync(`git log -1 --format=%ct ${path}`, { encoding: 'utf-8' }).trim(), 10) * 1000)
  } catch {
    return fs.statSync(path).mtime
  }
}

import packageJson from './package.json'
const appModifiedTime = getModifiedTime('./src/App.tsx')
const resumeDataModifiedTime = getModifiedTime('./public/resume.yaml')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  define: {
    APP_URL: JSON.stringify(packageJson.homepage),
    APP_MODIFIED_TIMESTAMP: JSON.stringify(appModifiedTime),
    APP_DATA: JSON.stringify(packageJson.data),
    RESUME_MODIFIED_TIMESTAMP: JSON.stringify(resumeDataModifiedTime),
  },  
})

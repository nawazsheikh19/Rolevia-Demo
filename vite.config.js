import {defineConfig} from 'vite';
export default defineConfig({base:process.env.GITHUB_PAGES==='true'?'/Rolevia-Demo/':'/',build:{target:'es2022'}});

/// <reference types="vite/client" />
declare module 'vite-tsconfig-paths' {
  import { Plugin } from 'vite';
  function tsconfigPaths(): Plugin;
  export default tsconfigPaths;
}
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_FRONTEND_BASE_URL: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GOOGLE_CLIENT_SECRET: string
  readonly VITE_GOOGLE_REDIRECT_URI: string
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
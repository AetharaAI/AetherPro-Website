/// <reference types="vite/client" />
declare module 'vite-tsconfig-paths' {
  import { Plugin } from 'vite';
  function tsconfigPaths(): Plugin;
  export default tsconfigPaths;
}
interface ImportMetaEnv {
  readonly VITE_APP_API_BASE_URL: string
  readonly VITE_APP_FRONTEND_BASE_URL: string
  readonly VITE_APP_GOOGLE_CLIENT_ID: string
  readonly VITE_APP_GOOGLE_CLIENT_SECRET: string
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
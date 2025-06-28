// config.ts

interface ImportMetaEnv {
  VITE_API_BASE_URL?: string;
  VITE_FRONTEND_BASE_URL?: string;
  VITE_GOOGLE_CLIENT_ID?: string;
  VITE_GOOGLE_CLIENT_SECRET?: string;
  VITE_GOOGLE_REDiRECT_URI?: string;
  // add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
// src/config.ts
// export const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.aetherprotech.com';
// You might also have a frontend base URL here if needed, e.g., for self-redirects
export const FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_BASE_URL || 'https:/www.aetherprotech.com';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID || '865938245821-k3457n4ns5nt9sokue0sl6484vfrb8kf.apps.googleusercontent.com';
export const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_APP_GOOGLE_CLIENT_SECRET || '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';
export const GOOGLE_REDIRECT_URI = `https://www.aetherprotech.com/api/auth/google/callback`;

// For production, these would be `https://api.aetherprotech.com` and `https://aetherprotech.com`.

// ### 3. Update `config/system_config.json` for `api_server_module`

// You'll need to configure the `auth` section in your overall `system_config.json` (or specifically in `modules/25_api_server_module.json` if it has its own config).

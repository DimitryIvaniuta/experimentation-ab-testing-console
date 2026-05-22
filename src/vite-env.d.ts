/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DEFAULT_EXPERIMENT_KEY?: string;
  readonly VITE_DEFAULT_ADMIN_TOKEN?: string;
  readonly VITE_REQUEST_TIMEOUT_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LICENSE_URI: string;
  readonly VITE_WIDEVINE_TOKEN: string;
  readonly VITE_PLAYREADY_TOKEN: string;
  readonly VITE_FAIRPLAY_TOKEN: string;
  readonly VITE_FAIRPLAY_CERT_URI: string;
  readonly VITE_FAIRPLAY_CERT_DER_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

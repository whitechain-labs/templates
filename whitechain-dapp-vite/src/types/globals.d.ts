/// <reference types="vite/client" />

// Typed public env vars. Declaring them here types `import.meta.env.VITE_*` as
// `string | undefined` instead of `any`. Add each new `VITE_*` var you read.
// (CSS side-effect imports are already typed by `vite/client`.)
interface ImportMetaEnv {
  readonly VITE_REOWN_PROJECT_ID?: string;
  readonly VITE_STORAGE_ADDRESS?: string;
}

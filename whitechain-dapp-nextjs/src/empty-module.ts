// Intentionally empty: the target for the Turbopack `resolveAlias` shim in
// next.config.mjs. wagmi's connector barrel statically references optional
// wallet SDKs this dapp never bundles; aliasing them here keeps the Turbopack
// build clean without dropping to `--webpack`.
export {};

// Ambient declarations for untyped imports.

// CSS side-effect imports (globals.css). Next handles these at build time; this
// keeps `tsc --noEmit` happy.
declare module '*.css';

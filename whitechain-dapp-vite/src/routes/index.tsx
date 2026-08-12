import { createFileRoute } from '@tanstack/react-router';

import { HomePage } from '@/components/home-page';

// File-based route for `/`. The route tree is generated into
// `src/routeTree.gen.ts` by the TanStack Router Vite plugin.
export const Route = createFileRoute('/')({
  component: HomePage,
});

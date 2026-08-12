import { Outlet, createRootRoute } from '@tanstack/react-router';

// Root route. Renders the matched child route via <Outlet />. Add app-wide
// layout chrome (header/footer) here when you need it.
export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return <Outlet />;
}

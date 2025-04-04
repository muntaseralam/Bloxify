import { Redirect, Route } from 'wouter';
import { useAdmin } from '@/hooks/useAdmin';

interface AdminProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function AdminProtectedRoute({ path, component: Component }: AdminProtectedRouteProps) {
  const { isAdmin } = useAdmin();

  return (
    <Route
      path={path}
      component={() => {
        // If they are an admin, render the requested component
        if (isAdmin) {
          return <Component />;
        }
        
        // Otherwise, redirect to the admin login page with return URL
        return <Redirect to={`/admin-login?redirect=${encodeURIComponent(path)}`} />;
      }}
    />
  );
}
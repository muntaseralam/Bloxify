import { Redirect, Route } from 'wouter';
import { useAdmin } from '@/hooks/useAdmin';
import { useRobloxUser } from '@/hooks/useRobloxUser';

interface AdminProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function AdminProtectedRoute({ path, component: Component }: AdminProtectedRouteProps) {
  const { isAdmin, isOwner } = useAdmin();
  const { user } = useRobloxUser();
  
  // Check if this is the owner account
  const isOwnerAccount = user?.username === "minecraftgamer523653";
  
  // Allow access if user is admin, owner, or has the specific username
  const hasAccess = isAdmin || isOwner || isOwnerAccount;

  return (
    <Route
      path={path}
      component={() => {
        // If they have access, render the requested component
        if (hasAccess) {
          return <Component />;
        }
        
        // Otherwise, redirect to the admin login page with return URL
        return <Redirect to={`/admin-login?redirect=${encodeURIComponent(path)}`} />;
      }}
    />
  );
}
import { useAuth } from '@/hooks/useAuth';
import { Redirect, Route } from 'wouter';

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="centered-content">
          <div className="loader"></div>
        </div>
      ) : !user ? (
        <Redirect to="/auth" />
      ) : (
        <Component />
      )}
    </Route>
  );
}
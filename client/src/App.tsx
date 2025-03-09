import { Switch, Route } from 'wouter';
import { AppProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/lib/ProtectedRoute';
import AuthPage from '@/pages/AuthPage';
import HomePage from '@/pages/HomePage';
import NotFound from '@/pages/NotFound';

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}

export default App; 
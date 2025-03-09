import { createContext, ReactNode, useContext, useState } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { User, LoginCredentials, RegisterCredentials } from '@/types';
import { authApi } from '@/lib/api';

// Cliente de consulta
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Provider global para o QueryClient
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

// Toast simples
function useToast() {
  const [toasts, setToasts] = useState<{id: string, message: string, type: string}[]>([]);
  
  const toast = ({
    title,
    description,
    variant = 'default'
  }: {
    title: string;
    description?: string;
    variant?: string;
  }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const message = `${title}${description ? `: ${description}` : ''}`;
    
    setToasts(prev => [...prev, { id, message, type: variant }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };
  
  return { toast, toasts };
}

// Contexto de autenticação
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useMutation<User, Error, LoginCredentials>>;
  logoutMutation: ReturnType<typeof useMutation<void, Error>>;
  registerMutation: ReturnType<typeof useMutation<User, Error, RegisterCredentials>>;
  toasts: {id: string, message: string, type: string}[];
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast, toasts } = useToast();
  
  const { data: user, error, isLoading } = useQuery<User, Error>({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getCurrentUser(),
    retry: false,
    gcTime: 0,
    staleTime: Infinity
  });

  const loginMutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data);
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo de volta, ${data.email}!`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Falha no login',
        description: error.message,
        variant: 'error',
      });
    },
  });

  const registerMutation = useMutation<User, Error, RegisterCredentials>({
    mutationFn: (credentials: RegisterCredentials) => authApi.register(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data);
      toast({
        title: 'Cadastro realizado com sucesso',
        description: `Bem-vindo, ${data.email}!`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Falha no cadastro',
        description: error.message,
        variant: 'error',
      });
    },
  });

  const logoutMutation = useMutation<void, Error>({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast({
        title: 'Logout realizado com sucesso',
      });
    },
    onError: (error) => {
      toast({
        title: 'Falha no logout',
        description: error.message,
        variant: 'error',
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        toasts,
      }}
    >
      {children}
      
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map(toast => (
            <div 
              key={toast.id} 
              className={`toast ${
                toast.type === 'error' 
                  ? 'toast-error' 
                  : 'toast-success'
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
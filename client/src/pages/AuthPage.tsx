import { useState } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { user, loginMutation, registerMutation } = useAuth();

  // Se usuário já estiver logado, redireciona para home
  if (user) {
    return <Redirect to="/" />;
  }

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    
    if (!loginData.email) {
      newErrors.loginEmail = 'O email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.loginEmail = 'Email inválido';
    }
    
    if (!loginData.password) {
      newErrors.loginPassword = 'A senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors: Record<string, string> = {};
    
    if (!registerData.email) {
      newErrors.registerEmail = 'O email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.registerEmail = 'Email inválido';
    }
    
    if (!registerData.password) {
      newErrors.registerPassword = 'A senha é obrigatória';
    } else if (registerData.password.length < 6) {
      newErrors.registerPassword = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateLogin()) {
      loginMutation.mutate(loginData);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateRegister()) {
      const { confirmPassword, ...userData } = registerData;
      registerMutation.mutate(userData);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="app-title">Todo App</h1>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>
            Login
          </button>
          <button 
            className={`tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>
            Cadastrar
          </button>
        </div>
        
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="loginEmail">E-mail</label>
              <input 
                id="loginEmail"
                type="email"
                className="form-input"
                placeholder="seu-email@exemplo.com"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              />
              {errors.loginEmail && (
                <div className="form-error">{errors.loginEmail}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="loginPassword">Senha</label>
              <input 
                id="loginPassword"
                type="password"
                className="form-input"
                placeholder="********"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              />
              {errors.loginPassword && (
                <div className="form-error">{errors.loginPassword}</div>
              )}
            </div>
            
            <button 
              type="submit" className="btn btn-primary btn-block" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="registerEmail">E-mail</label>
              <input 
                id="registerEmail"
                type="email"
                className="form-input"
                placeholder="seu-email@exemplo.com"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
              />
              {errors.registerEmail && (
                <div className="form-error">{errors.registerEmail}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="registerPassword">Senha</label>
              <input 
                id="registerPassword"
                type="password"
                className="form-input"
                placeholder="********"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
              />
              {errors.registerPassword && (
                <div className="form-error">{errors.registerPassword}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <input 
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="********"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
              />
              {errors.confirmPassword && (
                <div className="form-error">{errors.confirmPassword}</div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
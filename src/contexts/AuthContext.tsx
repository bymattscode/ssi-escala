import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role, AuthorizedUser } from '../lib/types';
import { AUTHORIZED_USERS } from '../lib/store';

interface AuthContextType {
  user: AuthorizedUser | null;
  role: Role;
  setRole: (role: Role) => void;
  userName: string;
  isAuthenticated: boolean;
  login: (nick: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthorizedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fallbacks para manter compatibilidade com o código existente
  const role = user?.role || "Convidado";
  const userName = user?.habboNick || "Desconhecido";
  const isAuthenticated = !!user;

  useEffect(() => {
    // Verificar sessão no localStorage
    const savedSession = localStorage.getItem('ssi-auth-session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Verificar se expirou (2 horas = 7200000 ms)
        if (Date.now() - parsed.timestamp < 7200000) {
          const foundUser = AUTHORIZED_USERS.find(u => u.habboNick.toLowerCase() === parsed.nick.toLowerCase() && u.status === 'Ativo');
          if (foundUser) {
            setUser(foundUser);
          } else {
            localStorage.removeItem('ssi-auth-session');
          }
        } else {
          localStorage.removeItem('ssi-auth-session');
        }
      } catch (e) {
        localStorage.removeItem('ssi-auth-session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (nick: string): Promise<boolean> => {
    const foundUser = AUTHORIZED_USERS.find(u => u.habboNick.toLowerCase() === nick.toLowerCase() && u.status === 'Ativo');
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('ssi-auth-session', JSON.stringify({
        nick: foundUser.habboNick,
        timestamp: Date.now()
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ssi-auth-session');
  };

  const setRole = (newRole: Role) => {
    if (user) {
      // Permitir que presidentes troquem de cargo para teste (temporário)
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, setRole, userName, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

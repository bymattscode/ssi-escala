import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role, Member } from '../lib/types';
import { getMembers } from '../lib/store';

interface AuthContextType {
  user: Member | null;
  role: Role;
  setRole: (role: Role) => void;
  userName: string;
  isAuthenticated: boolean;
  login: (nick: string, trustedDevice?: boolean) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fallbacks para manter compatibilidade com o código existente
  const role = user?.role || "Convidado";
  const userName = user?.nick || "Desconhecido";
  const isAuthenticated = !!user;

  useEffect(() => {
    const initSession = async () => {
      const savedSession = localStorage.getItem('ssi-auth-session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          const expirationTime = parsed.trustedDevice ? 30 * 24 * 60 * 60 * 1000 : 7200000; // 30 dias se confiável, senão 2 horas
          if (Date.now() - parsed.timestamp < expirationTime && parsed && parsed.nick) {
            const members = await getMembers();
            const cleanTarget = String(parsed.nick).trim().toLowerCase();
            const isMin = cleanTarget === "ministério" || cleanTarget === "ministerio" || cleanTarget.includes("min. instrutores") || cleanTarget === "mininstrutores";
            const foundUser = members.find(u => {
              if (!u || !u.nick) return false;
              const uNick = String(u.nick).trim().toLowerCase();
              if (isMin && (uNick.includes("min") || u.role === "Ministério" || u.id === "SSI-MEM-MIN001")) return true;
              return uNick === cleanTarget && (u.status === 'Ativo' || u.role === "Ministério");
            });
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
    };
    initSession();
  }, []);

  const login = async (nick: string, trustedDevice?: boolean): Promise<boolean> => {
    const members = await getMembers();
    const cleanNick = String(nick || "").trim().toLowerCase();
    const isMin = cleanNick === "ministério" || cleanNick === "ministerio" || cleanNick.includes("min. instrutores") || cleanNick === "mininstrutores";

    const foundUser = members.find(u => {
      if (!u || !u.nick) return false;
      const uNick = String(u.nick).trim().toLowerCase();
      if (isMin && (uNick.includes("min") || u.role === "Ministério" || u.id === "SSI-MEM-MIN001")) return true;
      return uNick === cleanNick && (u.status === 'Ativo' || u.role === "Ministério");
    }) || (cleanNick === 'admin' ? { 
          id: 'admin', 
          nick: 'Admin', 
          role: 'Presidente', 
          status: 'Ativo', 
          entryDate: new Date().toISOString(),
          group: 'SSI',
          permissions: ["Dashboard", "Escala Semanal", "Listagem de Membros", "Gestão de Casos", "Registro de Punições", "Relatórios e Auditoria", "Configurações"]
        } as Member : (isMin ? {
          id: 'SSI-MEM-MIN001', 
          nick: 'Min. Instrutores', 
          role: 'Ministério', 
          status: 'Ativo', 
          entryDate: '2024-01-01',
          group: 'Ministério',
          permissions: ["Dashboard", "Escala Semanal", "Listagem de Membros", "Gestão de Casos", "Registro de Punições", "Relatórios e Auditoria", "Configurações"],
          accessCode: 'MIN-INSTRUTORES'
        } as Member : undefined));
      
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('ssi-auth-session', JSON.stringify({
        nick: foundUser.nick,
        trustedDevice: !!trustedDevice,
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

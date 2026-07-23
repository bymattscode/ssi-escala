import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Role } from '../lib/types';

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  userName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicialmente usando "Presidente" por padrão, mas pode ser trocado na interface
  const [role, setRole] = useState<Role>("Presidente");
  const [userName] = useState("Admin");

  return (
    <AuthContext.Provider value={{ role, setRole, userName }}>
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

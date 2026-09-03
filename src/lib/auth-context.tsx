import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchApi } from './api';

interface User {
  id: string;
  email: string;
  name?: string;
  preferredCurrency: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('mitao_access_token');
      if (token) {
        try {
          const profile = await fetchApi<User>('/user/profile');
          setUser(profile);
        } catch (error) {
          console.error('Failed to restore session:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('mitao_access_token', accessToken);
    localStorage.setItem('mitao_refresh_token', refreshToken);
    try {
      const profile = await fetchApi<User>('/user/profile');
      setUser(profile);
    } catch (error) {
      console.error('Failed to fetch profile after login', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('mitao_access_token');
    localStorage.removeItem('mitao_refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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

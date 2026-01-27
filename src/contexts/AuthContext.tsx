import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/water';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'student' | 'staff') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, User & { password: string }> = {
  'student@campus.edu': {
    id: '1',
    email: 'student@campus.edu',
    name: 'Aarav Mehta',
    role: 'student',
    password: 'demo123',
  },
  'staff@campus.edu': {
    id: '2',
    email: 'staff@campus.edu',
    name: 'Dr. Priya Sharma',
    role: 'staff',
    password: 'demo123',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('hydroalert_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser) as User;

      // Small migration: keep demo accounts consistent with Indian names
      const migrated: User =
        parsed?.email?.toLowerCase() === 'student@campus.edu'
          ? { ...parsed, name: 'Aarav Mehta' }
          : parsed?.email?.toLowerCase() === 'staff@campus.edu'
            ? { ...parsed, name: 'Dr. Priya Sharma' }
            : parsed;

      setUser(migrated);
      localStorage.setItem('hydroalert_user', JSON.stringify(migrated));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser = mockUsers[email.toLowerCase()];
    if (mockUser && mockUser.password === password) {
      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);
      localStorage.setItem('hydroalert_user', JSON.stringify(userWithoutPassword));
    } else {
      throw new Error('Invalid email or password');
    }
    
    setIsLoading(false);
  };

  const signup = async (email: string, password: string, name: string, role: 'student' | 'staff') => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (mockUsers[email.toLowerCase()]) {
      setIsLoading(false);
      throw new Error('An account with this email already exists');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
    };
    
    setUser(newUser);
    localStorage.setItem('hydroalert_user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hydroalert_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
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

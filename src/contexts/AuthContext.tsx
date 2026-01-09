import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/api';
import { authService } from '@/services/auth.service';
import { ApiError } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const token = localStorage.getItem('zonaazul_token');
      const storedUser = localStorage.getItem('zonaazul_user');

      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching current user
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('zonaazul_user', JSON.stringify(currentUser));
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('zonaazul_token');
          localStorage.removeItem('zonaazul_refresh_token');
          localStorage.removeItem('zonaazul_user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      
      // Store tokens first
      // Backend returns 'token' not 'accessToken'
      localStorage.setItem('zonaazul_token', response.token);
      localStorage.setItem('zonaazul_refresh_token', response.refreshToken);
      
      // Set token in axios default headers for immediate use
      const api = (await import('@/lib/api')).api;
      api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      
      // Fetch full user data to match User type
      try {
        const fullUser = await authService.getCurrentUser();

        // Allow admin and fiscal roles
        if (fullUser.role !== 'admin' && fullUser.role !== 'fiscal') {
          setIsLoading(false);
          return { success: false, error: 'Você não tem permissão para acessar este aplicativo.' };
        }

        localStorage.setItem('zonaazul_user', JSON.stringify(fullUser));
        setUser(fullUser);
      } catch (error) {
        console.error('Failed to fetch full user data:', error);
        // If getCurrentUser fails, use the user from login response
        // Map it to match User type structure
        const mappedUser: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role as User['role'],
          avatar: response.user.avatar,
          emailVerified: false,
          phoneVerified: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Allow admin and fiscal roles
        if (mappedUser.role !== 'admin' && mappedUser.role !== 'fiscal') {
          setIsLoading(false);
          return { success: false, error: 'Você não tem permissão para acessar este aplicativo.' };
        }
        
        localStorage.setItem('zonaazul_user', JSON.stringify(mappedUser));
        setUser(mappedUser);
      }

      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('zonaazul_refresh_token');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage
      setUser(null);
      localStorage.removeItem('zonaazul_token');
      localStorage.removeItem('zonaazul_refresh_token');
      localStorage.removeItem('zonaazul_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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

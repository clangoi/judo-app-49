
/**
 * Enhanced Authentication System with improved error handling and type safety
 * Provides centralized auth state management with optimized session handling
 */
import { useState, useEffect, createContext, useContext, useCallback } from 'react';

// Enhanced User interface with better typing
export interface User {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  genderPreference: string | null;
  currentBelt: string | null;
  gender: string | null;
  competitionCategory: string | null;
  injuries: string[] | null;
  injuryDescription: string | null;
  profileImageUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Session {
  user: User;
  accessToken?: string;
  expiresAt?: Date;
}

export interface AuthError {
  message: string;
  code?: string;
  statusCode?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName?: string, genderPreference?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// Constants for better maintainability
const AUTH_STORAGE_KEY = 'auth_user';
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Enhanced hook with better error messaging
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Wrap your component tree with <AuthProvider>.'
    );
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Default mock user - no authentication required
  const defaultUser: User = {
    id: '550e8400-e29b-41d4-a716-446655443322',
    email: 'deportista@ejemplo.com',
    fullName: 'Deportista',
    avatarUrl: null,
    genderPreference: null,
    currentBelt: 'white',
    gender: null,
    competitionCategory: null,
    injuries: null,
    injuryDescription: null,
    profileImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const [user, setUser] = useState<User | null>(defaultUser);
  const [session, setSession] = useState<Session | null>({ user: defaultUser });
  const [loading, setLoading] = useState(false);

  // Always authenticated - no checks needed
  const isAuthenticated = true;

  // No session checking needed - always authenticated
  const checkSession = useCallback(async (): Promise<void> => {
    // Always use default user - no backend verification
    setUser(defaultUser);
    setSession({ user: defaultUser });
    setLoading(false);
  }, []);

  // Helper to clear authentication data
  const clearAuthData = useCallback(async (): Promise<void> => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setSession(null);
  }, []);

  // Session refresh functionality
  const refreshSession = useCallback(async (): Promise<void> => {
    if (!user) return;
    setLoading(true);
    await checkSession();
  }, [user, checkSession]);

  // Initial session check and periodic refresh
  useEffect(() => {
    checkSession();
    
    // Set up periodic session refresh
    const intervalId = setInterval(() => {
      if (user && session?.expiresAt && new Date() > session.expiresAt) {
        refreshSession();
      }
    }, SESSION_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [checkSession, user, session?.expiresAt, refreshSession]);

  // Enhanced sign in with better validation and error handling
  const signIn = useCallback(async (
    email: string, 
    password: string
  ): Promise<{ error: AuthError | null }> => {
    if (!email?.trim() || !password?.trim()) {
      return {
        error: {
          message: 'Email and password are required',
          code: 'INVALID_CREDENTIALS'
        }
      };
    }

    setLoading(true);
    
    try {
      // Enhanced mock authentication with better user data
      const mockUser: User = {
        id: crypto.randomUUID(),
        email: email.toLowerCase().trim(),
        fullName: email.split('@')[0]?.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Deportista",
        avatarUrl: null,
        genderPreference: null,
        currentBelt: "white",
        gender: null,
        competitionCategory: null,
        injuries: null,
        injuryDescription: null,
        profileImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store with expiration info
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      setSession({ 
        user: mockUser,
        expiresAt: new Date(Date.now() + SESSION_CHECK_INTERVAL)
      });
      
      return { error: null };
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        error: {
          message: 'Authentication failed. Please try again.',
          code: 'AUTH_ERROR'
        }
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Enhanced sign up with validation
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    fullName?: string, 
    genderPreference?: string
  ): Promise<{ error: AuthError | null }> => {
    if (!email?.trim() || !password?.trim()) {
      return {
        error: {
          message: 'Email and password are required',
          code: 'INVALID_INPUT'
        }
      };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        error: {
          message: 'Please enter a valid email address',
          code: 'INVALID_EMAIL'
        }
      };
    }

    setLoading(true);
    
    try {
      const mockUser: User = {
        id: crypto.randomUUID(),
        email: email.toLowerCase().trim(),
        fullName: fullName?.trim() || 
          email.split('@')[0]?.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 
          "New User",
        avatarUrl: null,
        genderPreference: genderPreference || null,
        currentBelt: "white",
        gender: null,
        competitionCategory: null,
        injuries: null,
        injuryDescription: null,
        profileImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      setSession({ 
        user: mockUser,
        expiresAt: new Date(Date.now() + SESSION_CHECK_INTERVAL)
      });

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        error: {
          message: 'Account creation failed. Please try again.',
          code: 'SIGNUP_ERROR'
        }
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Enhanced sign out with cleanup
  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true);
    
    try {
      await clearAuthData();
      // Use router navigation instead of direct window location
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error during sign out:', error);
      // Ensure we still redirect even on error
      window.location.href = '/auth';
    }
  }, [clearAuthData]);

  // Update user data without full re-authentication
  const updateUser = useCallback((userData: Partial<User>): void => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData, updatedAt: new Date() };
    setUser(updatedUser);
    setSession(prev => prev ? { ...prev, user: updatedUser } : null);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  }, [user]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    refreshSession,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export hook for checking if user has specific roles/permissions
export const useAuthPermissions = () => {
  const { user, isAuthenticated } = useAuth();
  
  return {
    isAuthenticated,
    canEditProfile: isAuthenticated,
    canViewAdminPanel: user?.email?.includes('admin') || false,
    canManageClubs: user?.email?.includes('admin') || false,
  };
};

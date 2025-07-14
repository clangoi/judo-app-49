
import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  genderPreference: string | null;
  clubId: string | null;
  clubName: string | null;
  currentBelt: string | null;
  gender: string | null;
  competitionCategory: string | null;
  injuries: string[] | null;
  injuryDescription: string | null;
  profileImageUrl: string | null;
  selectedClubLogoId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface Session {
  user: User;
  accessToken?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string, genderPreference?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Verify session with backend
          const response = await fetch('/api/auth/user', {
            headers: {
              'x-user-id': userData.id
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setSession({ user: data.user });
          } else {
            localStorage.removeItem('auth_user');
          }
        }
      } catch (error) {
        console.error('Failed to check session:', error);
        localStorage.removeItem('auth_user');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Create different mock users based on email for testing roles
      let mockUser: User;
      
      if (email.includes('admin')) {
        mockUser = {
          id: '550e8400-e29b-41d4-a716-446655440002',
          email,
          fullName: "Admin User",
          avatarUrl: null,
          genderPreference: null,
          clubId: null,
          clubName: null,
          currentBelt: "black",
          gender: null,
          competitionCategory: null,
          injuries: null,
          injuryDescription: null,
          profileImageUrl: null,
          selectedClubLogoId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else if (email.includes('entrenador') || email.includes('trainer')) {
        mockUser = {
          id: '550e8400-e29b-41d4-a716-446655440001',
          email,
          fullName: "Entrenador User",
          avatarUrl: null,
          genderPreference: null,
          clubId: null,
          clubName: null,
          currentBelt: "brown",
          gender: null,
          competitionCategory: null,
          injuries: null,
          injuryDescription: null,
          profileImageUrl: null,
          selectedClubLogoId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else {
        mockUser = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email,
          fullName: "Deportista User",
          avatarUrl: null,
          genderPreference: null,
          clubId: null,
          clubName: null,
          currentBelt: "white",
          gender: null,
          competitionCategory: null,
          injuries: null,
          injuryDescription: null,
          profileImageUrl: null,
          selectedClubLogoId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setSession({ user: mockUser });
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string, genderPreference?: string) => {
    try {
      // Create a mock user profile for demo purposes
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        fullName: fullName || "New User",
        avatarUrl: null,
        genderPreference,
        clubId: null,
        clubName: null,
        currentBelt: "white",
        gender: null,
        competitionCategory: null,
        injuries: null,
        injuryDescription: null,
        profileImageUrl: null,
        selectedClubLogoId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setSession({ user: mockUser });

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('auth_user');
      setUser(null);
      setSession(null);
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
      window.location.href = '/auth';
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

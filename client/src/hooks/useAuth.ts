import { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '@/lib/index';

/**
 * UniCampus Authentication Hook
 * Manages session persistence, role-based access, and API-based authentication.
 * Version: 2026.2.0
 */

const SESSION_STORAGE_KEY = 'unicampus_session_2026';
const TOKEN_STORAGE_KEY = 'unicampus_token_2026';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Hydrate user session from localStorage on initial mount
  useEffect(() => {
    const hydrateSession = () => {
      try {
        const storedUser = localStorage.getItem(SESSION_STORAGE_KEY);
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('[Auth] Failed to restore session:', error);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateSession();
  }, []);

  /**
   * loginWithToken: Direct login using API response user data
   * @param userData - User object from API response
   * @param authToken - JWT token from API response
   */
  const loginWithToken = useCallback((userData: any, authToken: string) => {
    // Ensure user has required fields for app
    const userWithDefaults: User = {
      id: userData._id || userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role as UserRole,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.email}`,
      studentId: userData.studentId,
      facultyId: userData.facultyId,
      branch: userData.branch,
      year: userData.year,
      cgpa: userData.cgpa,
      rollNumber: userData.rollNumber,
      status: userData.status,
    };

    setUser(userWithDefaults);
    setToken(authToken);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userWithDefaults));
    localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
    return userWithDefaults;
  }, []);

  /**
   * login: Legacy method for backward compatibility (not recommended for new code)
   * @param identifier - Student ID, Faculty ID, or email
   * @param role - Selected login role
   */
  const login = useCallback((identifier: string, role: UserRole) => {
    // This is kept for backward compatibility but shouldn't be used for real auth
    // Use loginWithToken instead
    const dummyUser: User = {
      id: `gen_${Date.now()}`,
      name: 'User',
      email: `${identifier.toLowerCase()}@nitcampus.edu`,
      role: role,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${identifier}`,
    };

    setUser(dummyUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(dummyUser));
    return Promise.resolve(dummyUser);
  }, []);

  /**
   * logout: Destroys session and clears storage
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  /**
   * switchRole: Allows quick role toggling for demo/testing purposes without re-login
   */
  const switchRole = useCallback((newRole: UserRole) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, role: newRole };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  /**
   * updateProfile: Helper to update user details in current session
   */
  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isAuthenticated = !!user;

  /**
   * getAuthToken: Returns the current auth token for API calls
   */
  const getAuthToken = useCallback(() => {
    return token || localStorage.getItem(TOKEN_STORAGE_KEY);
  }, [token]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    loginWithToken,
    logout,
    switchRole,
    updateProfile,
    getAuthToken,
  };
};

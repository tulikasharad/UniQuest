import { useState, useEffect } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
}

/**
 * Simple auth hook using localStorage.
 * Stores the logged-in user and JWT token.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const stored = localStorage.getItem("uniquest_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("uniquest_user");
        localStorage.removeItem("uniquest_token");
      }
    }
    setIsLoading(false);
  }, []);

  const isAuthenticated = user !== null;

  const signIn = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem("uniquest_user", JSON.stringify(userData));
    localStorage.setItem("uniquest_token", token);
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("uniquest_user");
    localStorage.removeItem("uniquest_token");
  };

  const getToken = (): string | null => {
    return localStorage.getItem("uniquest_token");
  };

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
    getToken,
  };
}

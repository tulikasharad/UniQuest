import { useState, useEffect } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
}

/**
 * Simple auth hook using localStorage.
 * For now, provides a basic logged-in/logged-out state.
 * Real authentication will be added later with Express + JWT.
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
      }
    }
    setIsLoading(false);
  }, []);

  const isAuthenticated = user !== null;

  const signIn = (userData: User) => {
    setUser(userData);
    localStorage.setItem("uniquest_user", JSON.stringify(userData));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("uniquest_user");
  };

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}

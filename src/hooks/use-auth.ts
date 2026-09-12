import { useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
}

function getSavedUser(): User | null {
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (!token || !savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser) as User;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(getSavedUser);

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const getToken = (): string | null => {
    return localStorage.getItem("token");
  };

  return {
    user,
    isLoading: false,
    isAuthenticated: user !== null,
    signOut,
    getToken,
  };
}

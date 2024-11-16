"use client";

import { createContext, FC, ReactElement, useContext, useEffect, useState } from "react";
import api from "@/utils/axiosInterceptor";
import { User } from "@/types/Space";

interface UserContextState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetchUser: () => Promise<void>;
}

interface ApiResponse {
  data: User;
  success: boolean;
}

const UserContext = createContext<UserContextState | undefined>(undefined);

interface UserContextProviderProps {
  children: ReactElement;
}

export const UserContextProvider: FC<UserContextProviderProps> = ({ children }) => {
  const [state, setState] = useState<UserContextState>({
    user: null,
    isLoading: true,
    error: null,
    refetchUser: async () => await fetchUserData(),
  });

  const [isClient, setIsClient] = useState<boolean>(false);

  const fetchUserData = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await api.get<ApiResponse>("/user/");
      
      if (response.data && response.data.data) {
        setState(prev => ({
          ...prev,
          user: response.data.data,
          isLoading: false,
        }));
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setState(prev => ({
        ...prev,
        user: null,
        error: error instanceof Error ? error : new Error("Failed to fetch user data"),
        isLoading: false,
      }));
    }
  };

  // Handle client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle user data fetching
  useEffect(() => {
    if (!isClient) return;

    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    } else {
      setState(prev => ({
        ...prev,
        isLoading: false,
        user: null,
      }));
    }
  }, [isClient]);

  return (
    <UserContext.Provider value={state}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): User | null => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }

  return context.user;
};

// Custom hook to access the full context state when needed
export const useUserContextState = (): UserContextState => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error("useUserContextState must be used within a UserContextProvider");
  }

  return context;
};
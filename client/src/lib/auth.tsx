import { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type UserProfile } from "@shared/schema";

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: any) => Promise<void>;
  basicSignup: (email: string, password: string) => Promise<void>;
  completeProfile: (profileData: FormData) => Promise<void>;
  refetch: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      return response.json();
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest('POST', '/api/auth/signup', userData);
      return response.json();
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const signup = async (userData: any) => {
    await signupMutation.mutateAsync(userData);
  };

  const basicSignup = async (email: string, password: string) => {
    const response = await apiRequest("/api/auth/signup-basic", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });
    setUser(response);
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  };

  const completeProfile = async (profileData: FormData) => {
    const response = await apiRequest("/api/auth/complete-profile", {
      method: "POST",
      body: profileData,
    });
    setUser(response);
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  };

  const refetch = async () => {
    try {
      const response = await apiRequest("/api/auth/me");
      setUser(response);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        basicSignup,
        completeProfile,
        refetch,
        isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending || signupMutation.isPending,
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

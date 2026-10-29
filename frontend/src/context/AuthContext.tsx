"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ApiClient } from "@/lib/api";
import { translations, SupportedLang } from "@/lib/translations";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  profile?: {
    education_level?: string;
    stream_or_major?: string;
    target_domain?: string;
    preferred_language?: SupportedLang;
    career_clarity_score?: number;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  lang: SupportedLang;
  t: (typeof translations)["en"];
  setLanguage: (lang: SupportedLang) => void;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<SupportedLang>("en");

  const setLanguage = (newLang: SupportedLang) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("pathfinder_lang", newLang);
    }
  };

  const login = (authToken: string, userData: UserProfile) => {
    setToken(authToken);
    setUser(userData);
    ApiClient.setToken(authToken);
    if (typeof window !== "undefined") {
      localStorage.setItem("pathfinder_user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    ApiClient.clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const refreshUser = async () => {
    try {
      const data = await ApiClient.getMe();
      setUser(data);
      if (data?.profile?.preferred_language) {
        setLang(data.profile.preferred_language as SupportedLang);
      }
    } catch (e) {
      console.warn("User session verification failed or expired");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = (localStorage.getItem("pathfinder_lang") as SupportedLang) || "en";
      setLang(savedLang);

      const savedToken = localStorage.getItem("pathfinder_token");
      const savedUser = localStorage.getItem("pathfinder_user");

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          refreshUser();
        } catch (e) {
          ApiClient.clearToken();
        }
      }
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        lang,
        t: translations[lang] || translations.en,
        setLanguage,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


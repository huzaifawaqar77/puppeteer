"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { Models } from "appwrite";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error: any) {
      // 401 is expected when not logged in, silently handle it
      if (error?.code !== 401) {
        console.error("Auth error:", error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      console.log("📧 Creating session for:", email);

      // Try to delete any existing session first
      try {
        await account.deleteSession("current");
        console.log("🗑️ Deleted existing session");
      } catch (e) {
        // No existing session, that's fine
        console.log("ℹ️ No existing session to delete");
      }

      await account.createEmailPasswordSession(email, password);
      console.log("🔑 Session created, fetching user data...");
      const currentUser = await account.get();
      console.log("👤 User data fetched:", currentUser.name);
      setUser(currentUser);
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error;
    }
  }

  async function register(email: string, password: string, name: string) {
    try {
      console.log("📝 Creating new user account...");
      const newUser = await account.create("unique()", email, password, name);
      console.log("✅ Account created:", newUser.name);

      // Login the user
      await login(email, password);

      // Create API key for the new user in FREE tier
      console.log("🔑 Creating API key for new user...");
      const apiKeyResponse = await fetch("/api/auth/create-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: newUser.$id,
        }),
      });

      if (!apiKeyResponse.ok) {
        console.error(
          "⚠️ Failed to create API key, but user account is created"
        );
        // Don't throw error - user is already created and logged in
      } else {
        const apiKeyData = await apiKeyResponse.json();
        console.log("✅ API key created successfully");
        console.log("📦 API Key:", apiKeyData.apiKey);
      }
    } catch (error) {
      console.error("❌ Registration failed:", error);
      throw error;
    }
  }

  async function logout() {
    await account.deleteSession("current");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

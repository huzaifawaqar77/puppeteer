"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface ApiKey {
  id: string;
  keyPrefix: string;
  name: string;
  tier: string;
  status: string;
  requestCount: number;
  dailyLimit?: number;
  expiresAt?: string;
}

interface ApiKeyContextType {
  apiKey: ApiKey | null;
  isLoading: boolean;
  error: string | null;
  refreshApiKey: () => Promise<void>;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApiKey = async () => {
    if (!user?.$id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch premium API keys for this user
      const response = await fetch("/api/user/api-keys", {
        headers: {
          Authorization: `Bearer ${user.$id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch API keys");
      }

      const data = await response.json();
      const keys = data.keys || [];

      // Find a premium key that is active
      const premiumKey = keys.find(
        (k: ApiKey) => k.tier === "premium" && k.status === "active"
      );

      if (premiumKey) {
        setApiKey(premiumKey);
      } else {
        // Try to find any active key (free tier can also work for some endpoints)
        const activeKey = keys.find((k: ApiKey) => k.status === "active");
        setApiKey(activeKey || null);
      }
    } catch (err) {
      console.error("Failed to fetch API key:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch API key");
      setApiKey(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKey();
  }, [user?.$id]);

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        isLoading,
        error,
        refreshApiKey: fetchApiKey,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error("useApiKey must be used within ApiKeyProvider");
  }
  return context;
}

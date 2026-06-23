"use client";

import { useCallback, useEffect, useState } from "react";

type TelegramWebApp = {
  expand?: () => void;
  initData?: string;
  ready?: () => void;
};

type TelegramUser = {
  firstName: string;
  lastName: string | null;
  photoUrl: string | null;
  telegramUserId: number;
  username: string | null;
};

type AuthState = {
  authenticated: boolean;
  loading: boolean;
  user: TelegramUser | null;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function useTelegramAuth() {
  const [state, setState] = useState<AuthState>({
    authenticated: false,
    loading: true,
    user: null,
  });

  const refresh = useCallback(async () => {
    const response = await fetch("/api/auth/telegram", {
      cache: "no-store",
    });
    const data = await response.json();

    setState({
      authenticated: Boolean(data.authenticated),
      loading: false,
      user: data.user ?? null,
    });
  }, []);

  const authenticate = useCallback(async (initData: string) => {
    const response = await fetch("/api/auth/telegram", {
      body: JSON.stringify({ initData }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const data = await response.json();

    setState({
      authenticated: response.ok && Boolean(data.authenticated),
      loading: false,
      user: response.ok ? (data.user ?? null) : null,
    });

    return response.ok;
  }, []);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    webApp?.ready?.();
    webApp?.expand?.();

    const timer = window.setTimeout(() => {
      if (webApp?.initData) {
        void authenticate(webApp.initData ?? "");
        return;
      }

      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [authenticate, refresh]);

  return {
    ...state,
    authenticate,
    isTelegramMiniApp: Boolean(
      typeof window !== "undefined" && window.Telegram?.WebApp?.initData,
    ),
    refresh,
  };
}

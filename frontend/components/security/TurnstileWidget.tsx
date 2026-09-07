"use client";

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: (errorCode: string) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          action?: string;
          cData?: string;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

export interface TurnstileWidgetRef {
  reset: () => void;
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

// Cloudflare official testing site key (Always passes in development/testing)
const FALLBACK_TEST_SITE_KEY = "1x00000000000000000000AA";

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  ({ onVerify, onExpire, onError, theme = "light", className = "" }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const siteKey =
      process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || FALLBACK_TEST_SITE_KEY;

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    useEffect(() => {
      // 1. Check if script is already in the document
      let script = document.querySelector<HTMLScriptElement>(
        'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
      );

      const handleScriptLoad = () => {
        setIsLoaded(true);
      };

      if (!script) {
        script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = handleScriptLoad;
        document.head.appendChild(script);
      } else {
        if (window.turnstile) {
          setIsLoaded(true);
        } else {
          script.addEventListener("load", handleScriptLoad);
        }
      }

      return () => {
        if (script) {
          script.removeEventListener("load", handleScriptLoad);
        }
      };
    }, []);

    useEffect(() => {
      if (!isLoaded || !containerRef.current || !window.turnstile) return;

      // Clean up previous widget if any
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore removal errors
        }
        widgetIdRef.current = null;
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            onVerify(token);
          },
          "expired-callback": () => {
            if (onExpire) onExpire();
          },
          "error-callback": (error: string) => {
            if (onError) onError(error);
          },
          theme: theme,
          size: "normal",
        });

        widgetIdRef.current = id;
      } catch (err) {
        console.warn("[TURNSTILE] Failed to render Turnstile widget:", err);
      }

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // Ignore
          }
          widgetIdRef.current = null;
        }
      };
    }, [isLoaded, siteKey, theme, onVerify, onExpire, onError]);

    return (
      <div className={`flex flex-col items-center justify-center my-2 ${className}`}>
        <div ref={containerRef} className="min-h-[65px] flex items-center justify-center w-full" />
      </div>
    );
  }
);

TurnstileWidget.displayName = "TurnstileWidget";

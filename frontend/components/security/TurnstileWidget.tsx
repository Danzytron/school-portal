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
          retry?: "auto" | "never";
          "retry-interval"?: number;
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

// Cloudflare official production site key for cebucecportal.site
const PRODUCTION_SITE_KEY = "0x4AAAAAAEq6BIAOsz02RBTv";
// Cloudflare official test site key (for localhost/dev environments)
const DEV_TEST_SITE_KEY = "1x00000000000000000000AA";

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  ({ onVerify, onExpire, onError, theme = "light", className = "" }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const isRenderedRef = useRef<boolean>(false);
    const [isScriptReady, setIsScriptReady] = useState(false);

    // Keep callbacks in refs to prevent unnecessary widget re-renders
    const onVerifyRef = useRef(onVerify);
    const onExpireRef = useRef(onExpire);
    const onErrorRef = useRef(onError);

    useEffect(() => {
      onVerifyRef.current = onVerify;
      onExpireRef.current = onExpire;
      onErrorRef.current = onError;
    });

    // Expose reset method to parent
    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch (e) {
            console.warn("[TURNSTILE] Reset warning:", e);
          }
        }
      },
    }));

    // 1. Singleton Script Loader: Ensure Cloudflare Turnstile API script is loaded once
    useEffect(() => {
      if (typeof window === "undefined") return;

      if (window.turnstile) {
        setIsScriptReady(true);
        return;
      }

      let script = document.querySelector<HTMLScriptElement>(
        'script[src*="challenges.cloudflare.com/turnstile"]'
      );

      const handleLoaded = () => {
        if (window.turnstile) {
          setIsScriptReady(true);
        }
      };

      if (!script) {
        script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = handleLoaded;
        document.head.appendChild(script);
      } else {
        script.addEventListener("load", handleLoaded);
      }

      // Polling fallback in case load event already fired
      const interval = setInterval(() => {
        if (window.turnstile) {
          setIsScriptReady(true);
          clearInterval(interval);
        }
      }, 100);

      return () => {
        clearInterval(interval);
        if (script) {
          script.removeEventListener("load", handleLoaded);
        }
      };
    }, []);

    // 2. Render Widget Once when script & container are ready
    useEffect(() => {
      if (!isScriptReady || !containerRef.current || !window.turnstile) return;
      if (isRenderedRef.current) return;

      // Determine appropriate site key (env var > production key > dev key on localhost)
      let resolvedSiteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
      if (!resolvedSiteKey) {
        const isLocal =
          typeof window !== "undefined" &&
          (window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1" ||
            window.location.hostname.endsWith(".local"));
        resolvedSiteKey = isLocal ? DEV_TEST_SITE_KEY : PRODUCTION_SITE_KEY;
      }

      try {
        // Clear container content before render
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        const id = window.turnstile.render(containerRef.current, {
          sitekey: resolvedSiteKey,
          callback: (token: string) => {
            if (onVerifyRef.current) onVerifyRef.current(token);
          },
          "expired-callback": () => {
            if (onExpireRef.current) onExpireRef.current();
          },
          "error-callback": (errorCode: string) => {
            console.warn("[TURNSTILE] Verification error code:", errorCode);
            if (onErrorRef.current) onErrorRef.current(errorCode);
          },
          theme: theme,
          size: "normal",
          retry: "auto",
        });

        widgetIdRef.current = id;
        isRenderedRef.current = true;
      } catch (err) {
        console.error("[TURNSTILE] Render exception:", err);
      }

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // Ignore removal errors during unmount
          }
          widgetIdRef.current = null;
          isRenderedRef.current = false;
        }
      };
    }, [isScriptReady, theme]);

    return (
      <div className={`flex flex-col items-center justify-center my-2 ${className}`}>
        <div ref={containerRef} className="min-h-[65px] flex items-center justify-center w-full" />
      </div>
    );
  }
);

TurnstileWidget.displayName = "TurnstileWidget";

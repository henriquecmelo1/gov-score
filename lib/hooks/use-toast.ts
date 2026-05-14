"use client";

import { useState, useCallback } from "react";

const DEFAULT_DURATION = 2500;

/**
 * Custom hook for managing toast notifications
 * Handles showing and auto-hiding toast messages
 */
export function useToast(duration: number = DEFAULT_DURATION) {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback(
    (text: string) => {
      setMessage(text);
      const timeoutId = setTimeout(() => {
        setMessage(null);
      }, duration);

      return () => clearTimeout(timeoutId);
    },
    [duration]
  );

  const hide = useCallback(() => {
    setMessage(null);
  }, []);

  return {
    message,
    show,
    hide,
  };
}

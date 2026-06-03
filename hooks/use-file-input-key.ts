import { useState } from "react";

/**
 * Manages a numeric key for controlled file `<input>` elements.
 * Incrementing the key forces React to remount the input, clearing its value.
 *
 * @returns A tuple of `[key, resetKey]`.
 */
export function useFileInputKey(): [number, () => void] {
  const [key, setKey] = useState(0);
  return [key, () => setKey(k => k + 1)];
}

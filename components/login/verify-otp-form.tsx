"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyOtpSchema, VerifyOtpInput } from "@/lib/schemas/auth";
import { verifyOtpAction } from "@/actions/verify-otp";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email, otp: "" },
  });

  // Focus the first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Sync digits array to form value
  useEffect(() => {
    const otp = digits.join("");
    setValue("otp", otp, { shouldValidate: otp.length === 6 });
  }, [digits, setValue]);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      // Move back on backspace when current field is empty
      const newDigits = [...digits];
      newDigits[index - 1] = "";
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setDigits(newDigits);

    // Focus last filled input or the next empty one
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const onSubmit = async (data: VerifyOtpInput) => {
    setLoading(true);
    setError(null);

    const response = await verifyOtpAction(data);
    if (response?.error) {
      setError(response.error);
      setLoading(false);
    } else {
      router.push("/reset-password");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <label className="block text-sm font-medium text-foreground-muted mb-3 text-center">
          Código de verificação
        </label>
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-xl font-bold rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                error
                  ? "border-error/50 focus:border-error focus:ring-error/50"
                  : "border-border focus:border-primary/60 focus:ring-primary/30"
              } text-foreground bg-surface`}
              aria-label={`Dígito ${index + 1}`}
            />
          ))}
        </div>
        {errors.otp && (
          <p className="text-error text-xs mt-2 text-center" role="alert">
            {errors.otp.message}
          </p>
        )}
      </div>

      <p className="text-xs text-foreground-dim text-center">
        Enviamos um código de 6 dígitos para <span className="font-medium text-foreground-muted">{email}</span>
      </p>

      <Button type="submit" variant="primary" size="md" isLoading={loading} className="w-full">
        {loading ? "Verificando..." : "Verificar código"}
      </Button>
    </form>
  );
}

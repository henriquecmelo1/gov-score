"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { FormField } from "@/components/ui/form-field";

export function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }

    startTransition(() => {
      router.push(`/mural?${params.toString()}`);
    });
  }

  return (
    <div className="relative w-full">
      <FormField
        type="text"
        placeholder="Buscar vendedor ou comprador..."
        defaultValue={searchParams.get("search") || ""}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {isPending && (
        <div className="absolute right-3 top-8 animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
      )}
    </div>
  );
}
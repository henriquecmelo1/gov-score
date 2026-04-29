"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

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
      <input
        type="text"
        placeholder="Buscar empresa ou prefeitura..."
        className="h-10 w-full rounded-md border px-3 text-base"
        defaultValue={searchParams.get("search") || ""}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {isPending && (
        <div className="absolute right-3 top-3 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
      )}
    </div>
  );
}
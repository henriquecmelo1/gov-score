import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { LayoutGrid, LogIn, UserPlus, UserRound } from "lucide-react";

const outlinedPrimaryButtonClass = "inline-flex items-center gap-2 rounded-md border border-primary bg-white px-3 py-2 font-semibold text-primary transition hover:bg-primary-50";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = Boolean(user);

  return (
    <header className="sticky top-0 z-50 border-b border-secondary bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold text-primary">
          <Image src="/govscore.png" alt="Logo ScoreGov" height={35} width={70} />
        </Link>

        <div className="flex items-center gap-2 text-sm font-medium">
          <Link
            href="/mural"
            className={outlinedPrimaryButtonClass}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            Mural
          </Link>

          {isAuthenticated ? (
            <Link
              href="/profile"
              className={outlinedPrimaryButtonClass}
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              Perfil
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={outlinedPrimaryButtonClass}
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Entrar
              </Link>
              <Link
                href="/register"
                className={outlinedPrimaryButtonClass}
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Criar conta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
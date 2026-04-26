import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
          GovScore
        </Link>

        <div className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/mural"
            className="rounded-md px-3 py-2 text-slate-700 transition hover:bg-primary-50 hover:text-primary"
          >
            Mural
          </Link>

          {isAuthenticated ? (
            <Link
              href="/profile"
              className="rounded-md bg-primary px-3 py-2 text-white transition hover:bg-primary-700"
            >
              Perfil
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-slate-700 transition hover:bg-primary-50 hover:text-primary"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-3 py-2 text-white transition hover:bg-primary-700"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
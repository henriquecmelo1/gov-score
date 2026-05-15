"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutGrid, LogIn, Menu, X, UserPlus, UserRound, Users } from "lucide-react";

const navButtonClass =
  "inline-flex items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-2 font-semibold text-foreground-muted transition hover:border-primary/40 hover:text-primary hover:bg-primary-glow hover:shadow-[0_0_15px_-3px_var(--primary-glow)]";

type NavbarMenuProps = {
  isAuthenticated: boolean;
};

export function NavbarMenu({ isAuthenticated }: NavbarMenuProps) {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-lg border border-border bg-surface/60 p-2 text-foreground-muted transition hover:border-primary/40 hover:text-primary md:hidden"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls="mobile-navbar-menu"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>

      <div className="hidden items-center gap-2 text-sm font-medium md:flex">
        <Link href="/mural" className={navButtonClass}>
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          Mural
        </Link>

        <Link href="/debtors" className={navButtonClass}>
          <Users className="h-4 w-4" aria-hidden="true" />
          Compradores
        </Link>

        {isAuthenticated ? (
          <Link href="/profile" className={navButtonClass}>
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Perfil
          </Link>
        ) : (
          <>
            <Link href="/login" className={navButtonClass}>
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Entrar
            </Link>
            <Link href="/register" className={navButtonClass}>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Criar conta
            </Link>
          </>
        )}
      </div>

      {open ? (
        <div
          id="mobile-navbar-menu"
          className="absolute left-0 right-0 top-full border-b border-border-glow glass px-4 py-3 shadow-lg md:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            <Link href="/mural" className={navButtonClass} onClick={closeMenu}>
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              Mural
            </Link>

            <Link href="/debtors" className={navButtonClass} onClick={closeMenu}>
              <Users className="h-4 w-4" aria-hidden="true" />
              Compradores
            </Link>

            {isAuthenticated ? (
              <Link href="/profile" className={navButtonClass} onClick={closeMenu}>
                <UserRound className="h-4 w-4" aria-hidden="true" />
                Perfil
              </Link>
            ) : (
              <>
                <Link href="/login" className={navButtonClass} onClick={closeMenu}>
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Entrar
                </Link>
                <Link href="/register" className={navButtonClass} onClick={closeMenu}>
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

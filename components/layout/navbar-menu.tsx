"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutGrid, LogIn, Menu, X, UserPlus, UserRound, Users } from "lucide-react";

const outlinedPrimaryButtonClass =
  "inline-flex items-center gap-2 rounded-md border border-primary bg-white px-3 py-2 font-semibold text-primary transition hover:bg-primary-50";

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
        className="inline-flex items-center justify-center rounded-md border border-primary bg-white p-2 text-primary transition hover:bg-primary-50 md:hidden"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls="mobile-navbar-menu"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>

      <div className="hidden items-center gap-2 text-sm font-medium md:flex">
        <Link href="/mural" className={outlinedPrimaryButtonClass}>
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          Mural
        </Link>

        <Link href="/debtors" className={outlinedPrimaryButtonClass}>
          <Users className="h-4 w-4" aria-hidden="true" />
          Clientes
        </Link>

        {isAuthenticated ? (
          <Link href="/profile" className={outlinedPrimaryButtonClass}>
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Perfil
          </Link>
        ) : (
          <>
            <Link href="/login" className={outlinedPrimaryButtonClass}>
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Entrar
            </Link>
            <Link href="/register" className={outlinedPrimaryButtonClass}>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Criar conta
            </Link>
          </>
        )}
      </div>

      {open ? (
        <div
          id="mobile-navbar-menu"
          className="absolute left-0 right-0 top-full border-b border-secondary bg-white px-4 py-3 shadow-lg md:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            <Link href="/mural" className={outlinedPrimaryButtonClass} onClick={closeMenu}>
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              Mural
            </Link>

            <Link href="/debtors" className={outlinedPrimaryButtonClass} onClick={closeMenu}>
              <Users className="h-4 w-4" aria-hidden="true" />
              Clientes
            </Link>

            {isAuthenticated ? (
              <Link href="/profile" className={outlinedPrimaryButtonClass} onClick={closeMenu}>
                <UserRound className="h-4 w-4" aria-hidden="true" />
                Perfil
              </Link>
            ) : (
              <>
                <Link href="/login" className={outlinedPrimaryButtonClass} onClick={closeMenu}>
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Entrar
                </Link>
                <Link href="/register" className={outlinedPrimaryButtonClass} onClick={closeMenu}>
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

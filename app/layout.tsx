import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GovScore",
  description: "Plataforma de transparencia e gestao de vendas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-app text-foreground" suppressHydrationWarning>
        <header className="sticky top-0 z-50 border-b border-secondary bg-white/95 backdrop-blur">
          <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
            <Link href="/" className="text-xl font-semibold text-primary">
              GovScore
            </Link>
            <div className="flex items-center gap-1 text-sm font-medium">
              <Link href="/mural" className="rounded-md px-3 py-2 text-slate-700 transition hover:bg-primary-50 hover:text-primary">
                Mural
              </Link>
              <Link href="/profile" className="rounded-md px-3 py-2 text-slate-700 transition hover:bg-primary-50 hover:text-primary">
                Perfil
              </Link>
              <Link href="/login" className="rounded-md px-3 py-2 text-slate-700 transition hover:bg-primary-50 hover:text-primary">
                Entrar
              </Link>
              <Link href="/register" className="rounded-md bg-primary px-3 py-2 text-white transition hover:bg-primary-700">
                Criar conta
              </Link>
            </div>
          </nav>
        </header>

        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</div>
      </body>
    </html>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  footerText: string;
  footerLinkHref: string;
  footerLinkText: string;
  children: ReactNode;
};

export function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkHref,
  footerLinkText,
  children,
}: AuthCardProps) {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center p-2">
      <div className="w-full max-w-md rounded-xl border border-secondary bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>

        {children}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {footerText}{" "}
          <Link href={footerLinkHref} className="font-medium text-primary hover:underline">
            {footerLinkText}
          </Link>
        </p>
      </div>
    </main>
  );
}

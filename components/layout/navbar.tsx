import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { NavbarMenu } from "@/components/layout/navbar-menu";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = Boolean(user);

  return (
    <header className="sticky top-0 z-50 border-b border-border-glow glass">
      <nav className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold text-primary">
          <Image
            src="/govscore.png"
            alt="Logo ScoreGov"
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "120px", height: "auto" }}
          />
        </Link>

        <NavbarMenu isAuthenticated={isAuthenticated} />
      </nav>
    </header>
  );
}
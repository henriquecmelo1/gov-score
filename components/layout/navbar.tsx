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
    <header className="sticky top-0 z-50 border-b border-secondary bg-white/95 backdrop-blur">
      <nav className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold text-primary">
          <Image src="/govscore.png" alt="Logo ScoreGov" height={35} width={70} />
        </Link>

        <NavbarMenu isAuthenticated={isAuthenticated} />
      </nav>
    </header>
  );
}
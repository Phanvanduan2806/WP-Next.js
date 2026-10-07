"use client";

import Image from "next/image";
import Link from "next/link";

import Menu from "@/components/menus/Menu";
import MobileMenu from "@/components/menus/MobileMenu";
import { useSite } from "@/hooks/useSite";

export default function Header() {
  const {
    logo,
    loading,
  } = useSite();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">

        <Link
          href="/"
          className="flex items-center"
        >
          {loading ? (
            <div className="h-12 w-40 animate-pulse rounded-md bg-muted" />
          ) : logo?.url ? (
            <Image
              src={logo.url}
              alt={logo.alt}
              width={logo.width || 200}
              height={logo.height || 60}
              className="h-12 w-auto object-contain"
              unoptimized
            />
          ) : (
            <span className="text-xl font-semibold tracking-tight">
              ReactWP
            </span>
          )}
        </Link>

        <div className="hidden md:block">
          <Menu />
        </div>

        <div className="md:hidden">
          <MobileMenu />
        </div>

      </div>
    </header>
  );
}
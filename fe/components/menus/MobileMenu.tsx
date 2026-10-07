"use client";

import { useState } from "react";
import { Menu as MenuIcon } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

import Menu from "./Menu";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex size-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label="Mở menu"
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>

      <SheetContent side="right">
        <SheetHeader />

        <div className="px-4">
          <Menu
            mobile
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
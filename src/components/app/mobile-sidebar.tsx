"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarNav, type NavItem } from "@/components/app/sidebar-nav";
import { LogoutButton } from "@/components/app/logout-button";

export function MobileSidebar({
  items,
  user,
  contexto,
}: {
  items: NavItem[];
  user: { nome: string; email: string };
  contexto: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button aria-label="Abrir menu" className="text-brand-text">
          <Menu className="h-6 w-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="left-0 top-0 h-screen max-w-[18rem] translate-x-0 translate-y-0 rounded-none border-r">
        <DialogTitle className="text-xs uppercase tracking-wider text-brand-muted">
          {contexto}
        </DialogTitle>
        <div className="mt-4" onClick={() => setOpen(false)}>
          <SidebarNav items={items} />
        </div>
        <div className="mt-auto border-t border-brand-border pt-4">
          <div className="mb-2 px-3">
            <p className="truncate text-sm font-medium text-brand-text">
              {user.nome}
            </p>
            <p className="truncate text-xs text-brand-muted">{user.email}</p>
          </div>
          <LogoutButton />
        </div>
      </DialogContent>
    </Dialog>
  );
}

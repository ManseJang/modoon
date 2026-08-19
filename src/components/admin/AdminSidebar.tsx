"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { LayoutDashboard, ListChecks, LogOut, Users } from "lucide-react";
import { auth } from "@/lib/firebase/client";

const NAV_LINKS = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard, exact: true },
  { href: "/admin/lessons", label: "수업 관리", icon: ListChecks, exact: false },
  { href: "/admin/applicants", label: "전체 신청자", icon: Users, exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    await signOut(auth);
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-full shrink-0 flex-row gap-1 border-b border-border bg-surface px-4 py-2 sm:w-56 sm:flex-col sm:gap-1.5 sm:border-b-0 sm:border-r sm:px-3 sm:py-6">
      <div className="mb-2 hidden px-2 sm:block">
        <p className="text-xs font-bold text-muted">약수초</p>
        <p className="text-lg font-black text-primary">모두ON 관리자</p>
      </div>

      <nav className="flex flex-1 flex-row gap-1 sm:flex-col">
        {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active ? "bg-primary-light text-primary-dark" : "text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger hover:bg-danger-light"
      >
        <LogOut size={17} />
        로그아웃
      </button>
    </aside>
  );
}

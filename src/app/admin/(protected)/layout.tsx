import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/server/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col sm:flex-row">
      <AdminSidebar />
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</div>
    </div>
  );
}

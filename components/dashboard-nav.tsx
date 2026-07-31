"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/tasks", label: "Tasks" },
  { href: "/dashboard/invoices", label: "Invoices" },
  { href: "/dashboard/notifications", label: "Notifications" },
];

export default function DashboardNav({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-800 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="text-white font-bold text-lg">
            Tech Alchemy <span className="text-gray-400 font-normal">CRM</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map((link) => {
              const active =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Sign out
          </button>
        </div>

        <nav className="flex md:hidden items-center gap-1 pb-3 overflow-x-auto">
          {LINKS.concat(isAdmin ? [{ href: "/admin", label: "Admin" }] : []).map(
            (link) => {
              const active =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 px-3 py-1.5 rounded-md text-xs transition-colors ${
                    active
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            }
          )}
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">
        Dashboard
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-white">
        Welcome back
        {session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-2 text-gray-400">
        You&apos;re signed in. Session overview below.
      </p>

      <div className="mt-8 space-y-3 rounded-xl border border-gray-800 bg-gray-950 p-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Email</span>
          <strong className="text-white">{session.user.email}</strong>
        </div>
        <div className="h-px bg-gray-800" />
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Name</span>
          <span className="text-gray-300">{session.user.name || "—"}</span>
        </div>
        <div className="h-px bg-gray-800" />
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Role</span>
          <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-300">
            {session.user.role}
          </span>
        </div>
        <div className="h-px bg-gray-800" />
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">User ID</span>
          <code className="max-w-[60%] truncate font-mono text-xs text-gray-500">
            {session.user.id}
          </code>
        </div>
      </div>

      {session.user.role === "ADMIN" && (
        <p className="mt-6 text-sm text-gray-500">
          Admin privileges enabled.{" "}
          <Link href="/admin" className="underline underline-offset-4 text-gray-300 hover:text-white">
            Open admin panel
          </Link>
        </p>
      )}
    </div>
  );
}

import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Tech Alchemy <span className="text-zinc-500">CRM</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-zinc-500 sm:block">
            {session.user.email}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-500">
          Dashboard
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back
          {session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 text-zinc-500">You&apos;re signed in. Session overview below.</p>

        <div className="mt-8 space-y-3 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Email</span>
            <strong>{session.user.email}</strong>
          </div>
          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Name</span>
            <span>{session.user.name || "—"}</span>
          </div>
          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Role</span>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium dark:bg-zinc-800">
              {session.user.role}
            </span>
          </div>
          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">User ID</span>
            <code className="max-w-[60%] truncate font-mono text-xs text-zinc-500">
              {session.user.id}
            </code>
          </div>
        </div>

        {session.user.role === "ADMIN" && (
          <p className="mt-6 text-sm text-zinc-500">
            Admin privileges enabled.{" "}
            <Link href="/admin" className="underline underline-offset-4">
              Open admin panel
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}

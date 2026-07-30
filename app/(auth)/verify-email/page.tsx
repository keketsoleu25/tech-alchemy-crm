"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState(token ? "" : "Missing verification token");

  useEffect(() => {
    if (!token) return;

    fetch(`/api/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong");
      });
  }, [token]);

  return (
    <div className="max-w-md space-y-4 text-center">
      {status === "loading" && <p>Verifying your email…</p>}
      {status === "success" && (
        <>
          <p className="font-medium text-green-600">{message}</p>
          <Link
            href="/login"
            className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Go to Login
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <p className="font-medium text-red-600">{message}</p>
          <Link href="/register" className="underline">
            Register again
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex justify-center py-20">
      <Suspense fallback={<div>Loading…</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}

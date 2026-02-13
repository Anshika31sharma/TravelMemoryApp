"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace("/map");
    else router.replace("/login");
  }, [user, loading, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-earth-50">
      <LoadingSkeleton />
      <Link href="/login" className="mt-6 text-wander-teal font-medium hover:underline transition-opacity">
        Go to Login
      </Link>
    </main>
  );
}

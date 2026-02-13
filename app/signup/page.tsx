"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { auth } from "@/lib/api";
import { PageTransition } from "@/components/PageTransition";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await auth.signup({ name, email, password });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      localStorage.setItem("token", data.token);
      setUser(data.user);
      router.push("/map");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-earth-50 via-earth-100 to-earth-200">
      <PageTransition className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-earth-900 tracking-tight">
            Travel Memory Map
          </h1>
          <p className="text-earth-600 mt-2">Start mapping your adventures</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white/90 backdrop-blur rounded-2xl shadow-soft-lg p-8 border border-earth-200/50 hover-lift"
        >
          <h2 className="text-xl font-semibold text-earth-900 mb-6">Create account</h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-3 rounded-lg bg-wander-rose/10 text-wander-rose text-sm"
            >
              {error}
            </motion.div>
          )}

          <label className="block text-sm font-medium text-earth-700 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-wander-teal focus:border-transparent outline-none transition-all duration-200 mb-4 focus:shadow-[0_0_0_3px_rgba(13,148,136,0.15)]"
            placeholder="Your name"
          />

          <label className="block text-sm font-medium text-earth-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-wander-teal focus:border-transparent outline-none transition-all duration-200 mb-4 focus:shadow-[0_0_0_3px_rgba(13,148,136,0.15)]"
            placeholder="you@example.com"
          />

          <label className="block text-sm font-medium text-earth-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-wander-teal focus:border-transparent outline-none transition-all duration-200 mb-6 focus:shadow-[0_0_0_3px_rgba(13,148,136,0.15)]"
            placeholder="At least 6 characters"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-wander-teal text-white font-medium hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-press focus-ring"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <p className="mt-6 text-center text-earth-600 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-wander-teal font-medium hover:underline transition-opacity">
              Sign in
            </Link>
          </p>
        </motion.form>
      </PageTransition>
    </main>
  );
}

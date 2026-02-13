"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { trips, tags } from "@/lib/api";
import { PageTransition } from "@/components/PageTransition";

type Tag = { id: string; name: string };

export default function AddTripPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    country: "India",
    city: "",
    startDate: "",
    endDate: "",
    description: "",
    totalExpense: "",
  });

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    tags.list().then((r) => (r.ok ? r.json() : [])).then(setAllTags);
  }, []);

  function addTag(name: string) {
    const n = name.trim().toLowerCase();
    if (n && !selectedTags.includes(n)) {
      setSelectedTags([...selectedTags, n]);
      setTagInput("");
    }
  }

  function removeTag(name: string) {
    setSelectedTags(selectedTags.filter((t) => t !== name));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await trips.create({
        country: form.country,
        city: form.city,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description || undefined,
        totalExpense: form.totalExpense ? parseFloat(form.totalExpense) : null,
        tagNames: selectedTags,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create trip");
      router.push(`/trip/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create trip");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="skeleton w-32 h-6 rounded" /></div>;
  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-earth-50 to-earth-100 p-6">
      <PageTransition className="max-w-2xl mx-auto">
        <Link href="/map" className="text-wander-teal hover:underline mb-6 inline-block transition-opacity">
          ← Back to map
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-soft-lg p-8 border border-earth-200/50 hover-lift"
        >
          <h1 className="text-2xl font-bold text-earth-900 mb-6">Add a trip</h1>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-wander-rose/10 text-wander-rose text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-2">Country</label>
                <input
                  type="text"
                  required
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-wander-teal outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(13,148,136,0.15)]"
                  placeholder="e.g. India"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-2">City</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-wander-teal outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(13,148,136,0.15)]"
                  placeholder="e.g. Mumbai"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-2">Start date</label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-wander-teal outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-2">End date</label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-wander-teal outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-wander-teal outline-none resize-none"
                placeholder="Tell us about your trip..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">Total expense (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.totalExpense}
                onChange={(e) => setForm({ ...form, totalExpense: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-wander-teal outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(13,148,136,0.15)]"
                placeholder="e.g. 15000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-wander-teal/20 text-wander-teal text-sm"
                  >
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-wander-rose">
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(tagInput))}
                  className="flex-1 px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-wander-teal outline-none"
                  placeholder="solo, friends, family, work..."
                />
                <button
                  type="button"
                  onClick={() => addTag(tagInput)}
                  className="px-4 py-3 rounded-xl bg-earth-200 text-earth-700 hover:bg-earth-300"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {allTags.filter((t) => !selectedTags.includes(t.name.toLowerCase())).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => addTag(t.name)}
                    className="text-xs px-2 py-1 rounded bg-earth-100 text-earth-600 hover:bg-earth-200"
                  >
                    + {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-wander-teal text-white font-medium hover:bg-teal-700 disabled:opacity-50 transition-all duration-200 btn-press focus-ring"
              >
                {loading ? "Creating..." : "Create trip"}
              </button>
              <Link
                href="/map"
                className="px-6 py-3 rounded-xl border border-earth-200 text-earth-700 hover:bg-earth-50 transition-colors btn-press"
              >
                Cancel
              </Link>
            </div>
          </form>
        </motion.div>
      </PageTransition>
    </main>
  );
}

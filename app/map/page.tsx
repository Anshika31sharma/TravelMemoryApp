"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { trips, tags } from "@/lib/api";
import { useDebounce } from "@/lib/useDebounce";
import { MapLoadingSkeleton } from "@/components/LoadingSkeleton";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
});

type Trip = {
  id: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  coverPhoto?: string | null;
  tags: string[];
};

type Tag = { id: string; name: string };

export default function MapPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tripsData, setTripsData] = useState<Trip[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tagFilter, setTagFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const params: { tag?: string; search?: string } = {};
    if (tagFilter) params.tag = tagFilter;
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

    setLoading(true);
    Promise.all([
      trips.list(params).then((r) => r.json()),
      tags.list().then((r) => r.ok ? r.json() : []),
    ])
      .then(([data, tagsData]) => {
        setTripsData(Array.isArray(data) ? data : []);
        setAllTags(Array.isArray(tagsData) ? tagsData : []);
      })
      .catch(() => setTripsData([]))
      .finally(() => setLoading(false));
  }, [user, tagFilter, debouncedSearch]);

  if (authLoading) {
    return <LoadingSkeleton />;
  }

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col">
      <header className="flex-shrink-0 h-14 px-4 flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-earth-200/80 shadow-soft z-10">
        <Link href="/map" className="text-xl font-bold text-earth-900 transition-opacity hover:opacity-80">
          Travel Memory Map
        </Link>

        <div className="flex items-center gap-4">
          <input
            type="search"
            placeholder="Search city or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 px-3 py-2 text-sm rounded-lg border border-earth-200 focus:ring-2 focus:ring-wander-teal focus:border-transparent outline-none transition-all duration-200"
          />
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-earth-200 focus:ring-2 focus:ring-wander-teal outline-none transition-all duration-200"
          >
            <option value="">All tags</option>
            {allTags.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <Link
            href="/add-trip"
            className="px-4 py-2 rounded-lg bg-wander-teal text-white font-medium hover:bg-teal-700 transition-all duration-200 btn-press shadow-soft"
          >
            Add Trip
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-earth-600">{user.name}</span>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/login");
              }}
              className="text-sm text-earth-600 hover:text-wander-rose transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 relative">
        {loading ? (
          <MapLoadingSkeleton />
        ) : (
          <MapView trips={tripsData} />
        )}
      </main>
    </div>
  );
}

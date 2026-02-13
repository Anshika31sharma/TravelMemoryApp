"use client";

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-6">
      <div className="skeleton w-48 h-6 rounded-lg" />
      <div className="flex gap-3">
        <div className="skeleton w-24 h-4 rounded" />
        <div className="skeleton w-32 h-4 rounded" />
        <div className="skeleton w-20 h-4 rounded" />
      </div>
      <div className="skeleton w-64 h-10 rounded-xl" />
    </div>
  );
}

export function MapLoadingSkeleton() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 bg-earth-100/80">
      <div className="skeleton w-40 h-10 rounded-xl" />
      <div className="skeleton w-64 h-64 rounded-2xl" />
      <div className="skeleton w-32 h-4 rounded" />
    </div>
  );
}

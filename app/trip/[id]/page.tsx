"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { trips, tripDays, photos, photoUrl } from "@/lib/api";
import { PageTransition } from "@/components/PageTransition";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

type TripDay = { id: string; dayNumber: number; date: string; notes: string | null };
type Photo = { id: string; filename: string; originalName: string; caption: string | null; order: number };
type Trip = {
  id: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  description: string | null;
  totalExpense: string | number | null;
  tags: string[];
  tripDays: TripDay[];
  photos: Photo[];
};

export default function TripDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePhoto, setActivePhoto] = useState(0);

  // Add day form
  const [showAddDay, setShowAddDay] = useState(false);
  const [newDay, setNewDay] = useState({ dayNumber: 1, date: "", notes: "" });
  const [addingDay, setAddingDay] = useState(false);

  // Upload photos
  const [uploading, setUploading] = useState(false);

  // Edit / Delete photo
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !id) return;
    trips.get(id)
      .then((r) => {
        if (!r.ok) throw new Error("Trip not found");
        return r.json();
      })
      .then(setTrip)
      .catch(() => setError("Trip not found"))
      .finally(() => setLoading(false));
  }, [user, id]);

  function handleAddDay(e: React.FormEvent) {
    e.preventDefault();
    if (!trip) return;
    setAddingDay(true);
    tripDays.create(trip.id, {
      dayNumber: newDay.dayNumber,
      date: newDay.date,
      notes: newDay.notes || undefined,
    })
      .then((r) => r.json())
      .then(() => {
        setShowAddDay(false);
        setNewDay({ dayNumber: 1, date: "", notes: "" });
        return trips.get(id).then((r) => r.json());
      })
      .then(setTrip)
      .catch(() => setError("Failed to add day"))
      .finally(() => setAddingDay(false));
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length || !trip) return;
    setUploading(true);
    photos.upload(trip.id, files)
      .then((r) => {
        if (!r.ok) throw new Error("Upload failed");
        return trips.get(id).then((r) => r.json());
      })
      .then(setTrip)
      .catch(() => setError("Failed to upload photos"))
      .finally(() => {
        setUploading(false);
        e.target.value = "";
      });
  }

  function startEditPhoto(photo: Photo) {
    setEditingPhotoId(photo.id);
    setEditCaption(photo.caption || "");
  }

  function cancelEditPhoto() {
    setEditingPhotoId(null);
    setEditCaption("");
  }

  function handleSaveCaption(e: React.FormEvent) {
    e.preventDefault();
    if (!trip || !editingPhotoId) return;
    setSavingPhoto(true);
    photos.update(trip.id, editingPhotoId, { caption: editCaption || undefined })
      .then((r) => {
        if (!r.ok) throw new Error("Save failed");
        return trips.get(id).then((r) => r.json());
      })
      .then(setTrip)
      .then(() => cancelEditPhoto())
      .catch(() => setError("Failed to save caption"))
      .finally(() => setSavingPhoto(false));
  }

  function handleDeletePhoto(photoId: string, photoIndex: number) {
    if (!trip || !confirm("Delete this photo?")) return;
    setDeletingPhoto(true);
    photos.delete(trip.id, photoId)
      .then((r) => {
        if (!r.ok) throw new Error("Delete failed");
        return trips.get(id).then((r) => r.json());
      })
      .then((updated) => {
        setTrip(updated);
        const newList = updated.photos || [];
        if (newList.length === 0) {
          setActivePhoto(0);
        } else if (photoIndex >= newList.length) {
          setActivePhoto(Math.max(0, newList.length - 1));
        } else if (photoIndex === activePhoto) {
          setActivePhoto(Math.min(activePhoto, newList.length - 1));
        }
      })
      .catch(() => setError("Failed to delete photo"))
      .finally(() => setDeletingPhoto(false));
  }

  if (authLoading) return <LoadingSkeleton />;
  if (!user) return null;
  if (loading) return <LoadingSkeleton />;
  if (error || !trip) {
    return (
      <main className="min-h-screen p-6">
        <p className="text-wander-rose">{error || "Trip not found"}</p>
        <Link href="/map" className="text-wander-teal mt-4 inline-block">← Back to map</Link>
      </main>
    );
  }

  const photoList = trip.photos || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-earth-50 to-earth-100">
      <PageTransition>
      <header className="bg-white/95 backdrop-blur-md border-b border-earth-200/80 shadow-soft px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/map" className="text-wander-teal hover:underline">← Back to map</Link>
          <h1 className="text-xl font-bold text-earth-900">{trip.city}, {trip.country}</h1>
          <span className="text-earth-500 text-sm">
            {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Cover / Gallery */}
        <section>
          {photoList.length > 0 ? (
            <motion.div
              key={activePhoto}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl overflow-hidden bg-earth-100 shadow-soft-lg"
            >
              <div className="relative aspect-video">
                <img
                  src={photoUrl(photoList[activePhoto].filename)}
                  alt={photoList[activePhoto].originalName}
                  loading="lazy"
                  className="w-full h-full object-contain transition-opacity duration-200"
                />
                {/* Edit & Delete buttons */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => startEditPhoto(photoList[activePhoto])}
                    className="px-3 py-1.5 rounded-lg bg-black/50 text-white text-sm hover:bg-black/70 transition-all duration-200 btn-press"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(photoList[activePhoto].id, activePhoto)}
                    disabled={deletingPhoto}
                    className="px-3 py-1.5 rounded-lg bg-wander-rose/90 text-white text-sm hover:bg-wander-rose disabled:opacity-50 transition-all duration-200 btn-press"
                  >
                    {deletingPhoto ? "Deleting..." : "Delete"}
                  </button>
                </div>
                {photoList.length > 1 && (
                  <>
                    <button
                      onClick={() => { cancelEditPhoto(); setActivePhoto((p) => (p - 1 + photoList.length) % photoList.length); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all duration-200 btn-press"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => { cancelEditPhoto(); setActivePhoto((p) => (p + 1) % photoList.length); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all duration-200 btn-press"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {photoList.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => { cancelEditPhoto(); setActivePhoto(i); }}
                          className={`w-2 h-2 rounded-full ${i === activePhoto ? "bg-white" : "bg-white/50"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* Caption: edit form or display */}
              {editingPhotoId === photoList[activePhoto]?.id ? (
                <form onSubmit={handleSaveCaption} className="p-4 bg-white/90 flex flex-wrap items-end gap-2">
                  <input
                    type="text"
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Add a caption..."
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-earth-200 focus:ring-2 focus:ring-wander-teal outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={savingPhoto}
                    className="px-4 py-2 rounded-lg bg-wander-teal text-white text-sm disabled:opacity-50"
                  >
                    {savingPhoto ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditPhoto}
                    className="px-4 py-2 rounded-lg border border-earth-200 text-earth-600 text-sm"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                photoList[activePhoto]?.caption && (
                  <p className="p-4 text-earth-600 text-sm bg-white/50">{photoList[activePhoto].caption}</p>
                )
              )}
            </motion.div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-earth-300 aspect-video flex flex-col items-center justify-center bg-earth-50/50">
              <p className="text-earth-500 mb-4">No photos yet</p>
              <label className="px-4 py-2 rounded-lg bg-wander-teal text-white cursor-pointer hover:bg-teal-700">
                {uploading ? "Uploading..." : "Upload photos"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
          {photoList.length > 0 && (
            <label className="mt-3 inline-block px-4 py-2 text-sm rounded-lg border border-earth-200 text-earth-700 hover:bg-earth-50 cursor-pointer">
              {uploading ? "Uploading..." : "Add more photos"}
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          )}
        </section>

        {/* Info & Tags */}
        <section className="flex flex-wrap gap-4 items-start justify-between">
          <div>
            {trip.description && <p className="text-earth-700 mb-4">{trip.description}</p>}
            {trip.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {trip.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-wander-teal/20 text-wander-teal text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {trip.totalExpense != null && (
            <div className="px-4 py-2 rounded-xl bg-wander-amber/20 text-wander-amber font-medium">
              Total: ₹{Number(trip.totalExpense).toLocaleString("en-IN")}
            </div>
          )}
        </section>

        {/* Day-wise memories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-earth-900">Trip timeline</h2>
            <button
              onClick={() => setShowAddDay(true)}
              className="text-sm text-wander-teal hover:underline"
            >
              + Add day
            </button>
          </div>

          {showAddDay && (
            <form onSubmit={handleAddDay} className="mb-6 p-4 rounded-xl bg-white border border-earth-200">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-earth-600 mb-1">Day #</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newDay.dayNumber}
                    onChange={(e) => setNewDay({ ...newDay, dayNumber: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-earth-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-earth-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDay.date}
                    onChange={(e) => setNewDay({ ...newDay, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-earth-200"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-earth-600 mb-1">Notes</label>
                <textarea
                  value={newDay.notes}
                  onChange={(e) => setNewDay({ ...newDay, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-earth-200 resize-none"
                  placeholder="What did you do this day?"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={addingDay} className="px-4 py-2 rounded-lg bg-wander-teal text-white text-sm">
                  {addingDay ? "Adding..." : "Add"}
                </button>
                <button type="button" onClick={() => setShowAddDay(false)} className="px-4 py-2 rounded-lg border border-earth-200 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {(trip.tripDays || []).length === 0 ? (
              <p className="text-earth-500 text-sm">No day memories yet. Add your first day above!</p>
            ) : (
              (trip.tripDays || [])
                .sort((a, b) => a.dayNumber - b.dayNumber)
                .map((day, i) => (
                  <motion.div
                    key={day.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex gap-4 p-4 rounded-xl bg-white border border-earth-200/50 shadow-soft hover-lift"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-wander-teal/20 text-wander-teal font-bold flex items-center justify-center">
                      {day.dayNumber}
                    </div>
                    <div>
                      <p className="text-sm text-earth-500">{new Date(day.date).toLocaleDateString()}</p>
                      <p className="text-earth-700 mt-1">{day.notes || "No notes"}</p>
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        </section>

        {/* Map link */}
        <section>
          <a
            href={`https://www.openstreetmap.org/?mlat=${trip.latitude}&mlon=${trip.longitude}&zoom=12`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-wander-teal hover:underline transition-opacity"
          >
            View on OpenStreetMap →
          </a>
        </section>
      </div>
      </PageTransition>
    </main>
  );
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function getHeaders(hasBody = false): HeadersInit {
  const headers: HeadersInit = {
    Authorization: `Bearer ${getToken()}`,
  };
  if (hasBody) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }
  return headers;
}

export async function authFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE}${path}`;
  const token = getToken();
  const headers: HeadersInit = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  if (options.body && typeof options.body === "string" && !headers["Content-Type"]) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }
  return fetch(url, { ...options, headers });
}

// Auth
export const auth = {
  signup: (data: { email: string; password: string; name: string }) =>
    authFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    authFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => authFetch("/auth/me"),
};

// Trips
export const trips = {
  list: (params?: { tag?: string; search?: string }) => {
    const search = new URLSearchParams(params as Record<string, string>).toString();
    return authFetch(`/trips${search ? `?${search}` : ""}`);
  },
  get: (id: string) => authFetch(`/trips/${id}`),
  create: (data: Record<string, unknown>) =>
    authFetch("/trips", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Record<string, unknown>) =>
    authFetch(`/trips/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    authFetch(`/trips/${id}`, { method: "DELETE" }),
};

// Trip days
export const tripDays = {
  list: (tripId: string) => authFetch(`/trips/${tripId}/days`),
  create: (tripId: string, data: { dayNumber: number; date: string; notes?: string }) =>
    authFetch(`/trips/${tripId}/days`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (tripId: string, dayId: string, data: { dayNumber?: number; date?: string; notes?: string }) =>
    authFetch(`/trips/${tripId}/days/${dayId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (tripId: string, dayId: string) =>
    authFetch(`/trips/${tripId}/days/${dayId}`, { method: "DELETE" }),
};

// Photos
const UPLOAD_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

export function photoUrl(filename: string): string {
  return `${UPLOAD_BASE}/uploads/${filename}`;
}

export const photos = {
  list: (tripId: string) => authFetch(`/trips/${tripId}/photos`),
  upload: (tripId: string, files: FileList | File[]) => {
    const form = new FormData();
    const arr = Array.isArray(files) ? files : Array.from(files);
    arr.forEach((f) => form.append("photos", f));
    const token = getToken();
    return fetch(`${API_BASE}/trips/${tripId}/photos`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
  },
  update: (tripId: string, photoId: string, data: { caption?: string; order?: number }) =>
    authFetch(`/trips/${tripId}/photos/${photoId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (tripId: string, photoId: string) =>
    authFetch(`/trips/${tripId}/photos/${photoId}`, { method: "DELETE" }),
};

// Tags
export const tags = {
  list: () => authFetch("/tags"),
};

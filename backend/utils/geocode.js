/**
 * Geocode city + country to lat/lng using OpenStreetMap Nominatim (free, no API key)
 */

const INDIA_CENTER = { lat: 20.5937, lon: 78.9629 };

export async function geocode(city, country) {
  const q = `${String(city).trim()}, ${String(country).trim()}`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'TravelMemoryMap/1.0' },
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (err) {
    console.warn('Geocoding failed:', err.message);
  }
  return INDIA_CENTER;
}

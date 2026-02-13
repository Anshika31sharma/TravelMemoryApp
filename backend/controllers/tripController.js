import prisma from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';
import { asyncHandler } from '../utils/errors.js';
import { geocode } from '../utils/geocode.js';

export const getTrips = asyncHandler(async (req, res) => {
  const { tag, search } = req.query;
  const userId = req.user.id;

  const where = { userId };

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { country: { contains: term } },
      { city: { contains: term } },
    ];
  }

  if (tag && tag.trim()) {
    where.tripTags = {
      some: {
        tag: { name: tag.trim() },
      },
    };
  }

  const trips = await prisma.trip.findMany({
    where,
    include: {
      tripTags: { include: { tag: true } },
      photos: { orderBy: { order: 'asc' }, take: 1 },
    },
    orderBy: { startDate: 'desc' },
  });

  const mapped = trips.map((t) => ({
    ...t,
    tags: t.tripTags.map((tt) => tt.tag.name),
    coverPhoto: t.photos[0]?.filename ?? null,
  }));

  res.json(mapped);
});

export const getTripById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const trip = await prisma.trip.findFirst({
    where: { id, userId },
    include: {
      tripTags: { include: { tag: true } },
      tripDays: { orderBy: { dayNumber: 'asc' } },
      photos: { orderBy: { order: 'asc' } },
    },
  });

  if (!trip) {
    throw new AppError('Trip not found.', 404);
  }

  res.json({
    ...trip,
    tags: trip.tripTags.map((tt) => tt.tag.name),
  });
});

export const createTrip = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    country,
    city,
    latitude,
    longitude,
    startDate,
    endDate,
    description,
    totalExpense,
    tagNames = [],
  } = req.body;

  if (!country || !city || !startDate || !endDate) {
    throw new AppError('Country, city, startDate and endDate are required.', 400);
  }

  let lat = latitude != null ? parseFloat(latitude) : null;
  let lon = longitude != null ? parseFloat(longitude) : null;
  if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) {
    const coords = await geocode(city, country);
    lat = coords.lat;
    lon = coords.lon;
  }

  const tagIds = [];
  if (Array.isArray(tagNames) && tagNames.length > 0) {
    for (const name of tagNames) {
      const n = String(name).trim();
      if (!n) continue;
      let tag = await prisma.tag.findFirst({ where: { name: n } });
      if (!tag) {
        tag = await prisma.tag.create({ data: { name: n } });
      }
      tagIds.push(tag.id);
    }
  }

  const trip = await prisma.trip.create({
    data: {
      userId,
      country: String(country).trim(),
      city: String(city).trim(),
      latitude: lat,
      longitude: lon,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description: description?.trim() || null,
      totalExpense: totalExpense != null ? parseFloat(totalExpense) : null,
      tripTags: tagIds.length
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
    include: {
      tripTags: { include: { tag: true } },
      tripDays: true,
      photos: true,
    },
  });

  res.status(201).json({
    ...trip,
    tags: trip.tripTags.map((tt) => tt.tag.name),
  });
});

export const updateTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const {
    country,
    city,
    latitude,
    longitude,
    startDate,
    endDate,
    description,
    totalExpense,
    tagNames,
  } = req.body;

  const existing = await prisma.trip.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new AppError('Trip not found.', 404);
  }

  const data = {};
  if (country != null) data.country = String(country).trim();
  if (city != null) data.city = String(city).trim();
  if (latitude != null) data.latitude = parseFloat(latitude);
  if (longitude != null) data.longitude = parseFloat(longitude);
  if (startDate != null) data.startDate = new Date(startDate);
  if (endDate != null) data.endDate = new Date(endDate);
  if (description !== undefined) data.description = description?.trim() || null;
  if (totalExpense !== undefined) data.totalExpense = totalExpense != null ? parseFloat(totalExpense) : null;

  if (Array.isArray(tagNames)) {
    await prisma.tripTag.deleteMany({ where: { tripId: id } });
    const tagIds = [];
    for (const name of tagNames) {
      const n = String(name).trim();
      if (!n) continue;
      let tag = await prisma.tag.findFirst({ where: { name: n } });
      if (!tag) tag = await prisma.tag.create({ data: { name: n } });
      tagIds.push(tag.id);
    }
    if (tagIds.length) {
      await prisma.tripTag.createMany({
        data: tagIds.map((tagId) => ({ tripId: id, tagId })),
      });
    }
  }

  const trip = await prisma.trip.update({
    where: { id },
    data,
    include: {
      tripTags: { include: { tag: true } },
      tripDays: { orderBy: { dayNumber: 'asc' } },
      photos: { orderBy: { order: 'asc' } },
    },
  });

  res.json({
    ...trip,
    tags: trip.tripTags.map((tt) => tt.tag.name),
  });
});

export const deleteTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const existing = await prisma.trip.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new AppError('Trip not found.', 404);
  }

  await prisma.trip.delete({ where: { id } });
  res.status(204).send();
});

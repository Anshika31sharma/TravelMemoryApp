import prisma from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';
import { asyncHandler } from '../utils/errors.js';

async function ensureTripAccess(userId, tripId) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) throw new AppError('Trip not found.', 404);
  return trip;
}

export const getTripDays = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  await ensureTripAccess(req.user.id, tripId);

  const days = await prisma.tripDay.findMany({
    where: { tripId },
    orderBy: { dayNumber: 'asc' },
  });
  res.json(days);
});

export const createTripDay = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { dayNumber, date, notes } = req.body;
  await ensureTripAccess(req.user.id, tripId);

  if (dayNumber == null || !date) {
    throw new AppError('dayNumber and date are required.', 400);
  }

  const day = await prisma.tripDay.create({
    data: {
      tripId,
      dayNumber: parseInt(dayNumber, 10),
      date: new Date(date),
      notes: notes?.trim() || null,
    },
  });
  res.status(201).json(day);
});

export const updateTripDay = asyncHandler(async (req, res) => {
  const { tripId, dayId } = req.params;
  const { dayNumber, date, notes } = req.body;
  await ensureTripAccess(req.user.id, tripId);

  const existing = await prisma.tripDay.findFirst({
    where: { id: dayId, tripId },
  });
  if (!existing) throw new AppError('Trip day not found.', 404);

  const data = {};
  if (dayNumber != null) data.dayNumber = parseInt(dayNumber, 10);
  if (date != null) data.date = new Date(date);
  if (notes !== undefined) data.notes = notes?.trim() || null;

  const day = await prisma.tripDay.update({
    where: { id: dayId },
    data,
  });
  res.json(day);
});

export const deleteTripDay = asyncHandler(async (req, res) => {
  const { tripId, dayId } = req.params;
  await ensureTripAccess(req.user.id, tripId);

  const existing = await prisma.tripDay.findFirst({
    where: { id: dayId, tripId },
  });
  if (!existing) throw new AppError('Trip day not found.', 404);

  await prisma.tripDay.delete({ where: { id: dayId } });
  res.status(204).send();
});

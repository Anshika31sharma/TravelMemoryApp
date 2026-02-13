import path from 'path';
import fs from 'fs';
import prisma from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';
import { asyncHandler } from '../utils/errors.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

async function ensureTripAccess(userId, tripId) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) throw new AppError('Trip not found.', 404);
  return trip;
}

export const getPhotos = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  await ensureTripAccess(req.user.id, tripId);

  const photos = await prisma.photo.findMany({
    where: { tripId },
    orderBy: { order: 'asc' },
  });
  res.json(photos);
});

export const uploadPhotos = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  await ensureTripAccess(req.user.id, tripId);

  if (!req.files?.length) {
    throw new AppError('No files uploaded.', 400);
  }

  const maxOrder = await prisma.photo
    .aggregate({ where: { tripId }, _max: { order: true } })
    .then((r) => (r._max.order ?? 0) + 1);

  const photos = [];
  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    const photo = await prisma.photo.create({
      data: {
        tripId,
        filename: file.filename,
        originalName: file.originalname,
        order: maxOrder + i,
      },
    });
    photos.push(photo);
  }

  res.status(201).json(photos);
});

export const updatePhoto = asyncHandler(async (req, res) => {
  const { tripId, photoId } = req.params;
  const { caption, order } = req.body;
  await ensureTripAccess(req.user.id, tripId);

  const existing = await prisma.photo.findFirst({
    where: { id: photoId, tripId },
  });
  if (!existing) throw new AppError('Photo not found.', 404);

  const data = {};
  if (caption !== undefined) data.caption = caption?.trim() || null;
  if (order != null) data.order = parseInt(order, 10);

  const photo = await prisma.photo.update({
    where: { id: photoId },
    data,
  });
  res.json(photo);
});

export const deletePhoto = asyncHandler(async (req, res) => {
  const { tripId, photoId } = req.params;
  await ensureTripAccess(req.user.id, tripId);

  const existing = await prisma.photo.findFirst({
    where: { id: photoId, tripId },
  });
  if (!existing) throw new AppError('Photo not found.', 404);

  const filePath = path.join(UPLOAD_DIR, existing.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await prisma.photo.delete({ where: { id: photoId } });
  res.status(204).send();
});

import prisma from '../utils/prisma.js';
import { asyncHandler } from '../utils/errors.js';

export const getTags = asyncHandler(async (req, res) => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(tags);
});

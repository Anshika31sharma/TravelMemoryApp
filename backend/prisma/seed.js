import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultTags = ['solo', 'friends', 'family', 'work', 'honeymoon', 'adventure', 'relaxation'];

async function main() {
  for (const name of defaultTags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Seeded default tags:', defaultTags);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

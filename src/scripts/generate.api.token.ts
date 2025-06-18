import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateRandomToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = Math.floor(Math.random() * (50 - 35 + 1)) + 35;

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

async function saveToken() {
  const token = generateRandomToken();

  const saved = await prisma.apiToken.create({
    data: {
      token, // adjust field name if different
    },
  });

  console.log('Token saved:', saved);
  await prisma.$disconnect();
}

saveToken().catch((e) => {
  console.error('Error saving token:', e);
  prisma.$disconnect();
  process.exit(1);
});

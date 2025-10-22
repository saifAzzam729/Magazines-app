import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const adminPassword = bcrypt.hashSync('admin123', 10);
  const publisherPassword = bcrypt.hashSync('publisher123', 10);
  const subscriberPassword = bcrypt.hashSync('subscriber123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: adminPassword },
    create: { email: 'admin@example.com', password: adminPassword, name: 'Admin', role: 'ADMIN' }
  });
  const publisher = await prisma.user.upsert({
    where: { email: 'publisher@example.com' },
    update: { password: publisherPassword },
    create: { email: 'publisher@example.com', password: publisherPassword, name: 'Publisher', role: 'PUBLISHER' }
  });
  const sub = await prisma.user.upsert({
    where: { email: 'subscriber@example.com' },
    update: { password: subscriberPassword },
    create: { email: 'subscriber@example.com', password: subscriberPassword, name: 'Subscriber', role: 'SUBSCRIBER' }
  });
  const mag = await prisma.magazine.create({ data: { title: 'Tech Weekly', description: 'Latest tech news', publisherId: publisher.id } });
  await prisma.subscription.create({ data: { userId: sub.id, magazineId: mag.id, status: 'ACTIVE', startDate: new Date(), endDate: new Date(Date.now() + 7 * 86400000) } });
}

main().finally(() => prisma.$disconnect());


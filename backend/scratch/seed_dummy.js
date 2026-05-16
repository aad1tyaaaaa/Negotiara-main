require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 12);
  
  const shipper = await prisma.user.upsert({
    where: { email: 'shipper@negotiara.ai' },
    update: {},
    create: {
      email: 'shipper@negotiara.ai',
      name: 'Dummy Shipper',
      password,
      role: 'SHIPPER',
    },
  });

  const carrier = await prisma.user.upsert({
    where: { email: 'carrier@negotiara.ai' },
    update: {},
    create: {
      email: 'carrier@negotiara.ai',
      name: 'Dummy Carrier',
      password,
      role: 'CARRIER',
    },
  });

  console.log('Seed successful:');
  console.log('Shipper:', shipper.email);
  console.log('Carrier:', carrier.email);
  console.log('Password: password123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

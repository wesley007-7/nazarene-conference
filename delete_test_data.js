const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.payment.deleteMany({});
  const deleted = await prisma.registrant.deleteMany({});
  console.log(`Successfully deleted ${deleted.count} test registrations.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

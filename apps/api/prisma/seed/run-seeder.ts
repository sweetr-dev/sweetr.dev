import { PrismaClient } from "@prisma/client";
import { seedAutomations } from "./automations";
import { seedMockWorkspace } from "./mock-workspace";

const prisma = new PrismaClient();

async function main() {
  await seedAutomations(prisma);
  await seedMockWorkspace(prisma);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

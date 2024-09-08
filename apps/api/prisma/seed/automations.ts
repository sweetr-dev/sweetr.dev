import { Automation, Prisma, PrismaClient } from "@prisma/client";

const automations: Omit<Automation, "id">[] = [
  {
    slug: "PR_TITLE_CHECK",
    title: "PR Title Requirements",
    description:
      "Enforce standards on Pull Request titles. Ticket code, specific prefix, or something else? You pick it.",
    shortDescription:
      "Enforce standards on Pull Request titles. Ticket code, specific prefix, or something else? You pick it.",
    demoUrl: "https://google.com",
    docsUrl: "https://docs.sweetr.dev",
    available: true,
    color: "red.1",
    icon: "✍️",
    benefits: {
      compliance: "Standardize Pull Request titles across the organization.",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const seedAutomations = async (prisma: PrismaClient) => {
  for (const automation of automations) {
    await prisma.automation.upsert({
      where: {
        slug: automation.slug,
      },
      create: {
        ...automation,
        benefits: automation.benefits as Prisma.InputJsonValue,
      },
      update: {},
    });
  }
};

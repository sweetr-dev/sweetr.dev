import { Automation, Prisma, PrismaClient } from "@prisma/client";

const automations: Omit<Automation, "id">[] = [
  {
    slug: "LABEL_PR_SIZE",
    title: "Label PR Size",
    description:
      "Automatically label a Pull Request with its size. Increase awareness on creating small PRs.",
    shortDescription:
      "Automatically label a Pull Request with its size. Increase awareness on creating small PRs.",
    demoUrl: "https://google.com",
    docsUrl: "https://docs.sweetr.dev",
    available: true,
    color: "red.1",
    icon: "📦",
    benefits: {
      cycleTime:
        "Helps encouraing smaller PRs and getting them reviewed faster.",
      failureRate: "Lower risks with smaller changesets.",
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

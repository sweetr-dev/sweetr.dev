import { Automation, Prisma, PrismaClient } from "@prisma/client";

const automations: Omit<Automation, "id">[] = [
  {
    slug: "PACKAGE_HEALTH",
    title: "Package Health Summary",
    description:
      "Summary of package health when changing dependencies, directly in your pull request. Supports NPM and Yarn.",
    shortDescription:
      "Summary of package health when changing dependencies, directly in your pull request. Supports NPM and Yarn.",
    demoUrl: "/images/package-health-summary.png",
    docsUrl:
      "https://docs.sweetr.dev/features/automations/packages-health-summary",
    available: true,
    color: "red.1",
    icon: "📦",
    benefits: {
      failureRate: "Truly understand the impact of a dependency change.",
      techDebt: "Prevent depending on badly maintained packages.",
      security: "Assess package vulnerabilities in a glance.",
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

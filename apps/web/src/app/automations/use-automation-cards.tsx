import { fork } from "radash";

const automationCards = {
  PR_TITLE_CHECK: {
    type: "PR_TITLE_CHECK",
    enabled: false,
    available: true,
    title: "PR Title Requirements",
    description:
      "Enforce standards on Pull Request titles. Ticket code, specific prefix, or something else? You pick it.",
    shortDescription:
      "Enforce standards on Pull Request titles. Ticket code, specific prefix, or something else? You pick it.",
    demoUrl: "/images/automations/pr-title-check-demo.webp",
    docsUrl: "https://docs.sweetr.dev/features/automations/pr-title-check",
    color: "red.1",
    icon: "✍️",
    benefits: {
      compliance: "Standardize Pull Request titles across the organization.",
    },
  },
  PR_SIZE_LABELER: {
    type: "PR_SIZE_LABELER",
    enabled: false,
    available: true,
    title: "Label PR Size",
    shortDescription:
      "Automatically label a Pull Request with its size. Increase awareness on creating small PRs.",
    description:
      "Automatically label a Pull Request with its size. Increase awareness on creating small PRs.",
    demoUrl: "/images/automations/pr-size-labeler.webp",
    docsUrl: "https://docs.sweetr.dev/features/automations/pr-size-labeler",
    color: "green.1",
    icon: "📏",
    benefits: {
      cycleTime: "Encourage faster reviews on smaller PRs.",
      failureRate: "Mitigate reviewer fatigue with smaller PRs.",
    },
  },
  CODE_FREEZE: {
    type: "CODE_FREEZE",
    enabled: false,
    available: false,
    title: "Code Freeze",
    shortDescription:
      "Big migration? Xmas break? Schedule a period where no PRs can be merged in selected repositories.",
    description:
      "Big migration? Xmas break? Schedule a period where no PRs can be merged in selected repositories.",
    demoUrl: "/images/automations/pr-title-check-demo.webp",
    docsUrl: "https://docs.sweetr.dev/",
    color: "blue.1",
    icon: "🧊",
    benefits: {
      failureRate: "Avoid failure risks during code freeze.",
    },
  },
};

export type AutomationCard =
  (typeof automationCards)[keyof typeof automationCards];

interface UseAutomationCards {
  automationCards: typeof automationCards;
  availableAutomations: AutomationCard[];
  futureAutomations: AutomationCard[];
}

export const useAutomationCards = (): UseAutomationCards => {
  const [availableAutomations, futureAutomations] = fork(
    Object.values(automationCards),
    (automation) => automation.available,
  );
  return {
    automationCards,
    availableAutomations,
    futureAutomations,
  };
};

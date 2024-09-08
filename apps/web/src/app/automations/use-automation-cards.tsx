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
    demoUrl: "https://google.com",
    docsUrl: "https://docs.sweetr.dev",
    color: "red.1",
    icon: "✍️",
    benefits: {
      compliance: "Standardize Pull Request titles across the organization.",
    },
  },
  PR_SIZE_LABELER: {
    type: "PR_SIZE_LABELER",
    enabled: false,
    available: false,
    title: "Label PR Size",
    shortDescription:
      "Automatically label a Pull Request with its size. Increase awareness on creating small PRs.",
    status: "soon" as const,
    color: "green.1",
    icon: "📏",
    benefits: {
      cycleTime: "Encourage faster reviews on smaller PRs.",
      failureRate: "Encourage smaller PRs.",
    },
  },
  NOTIFY_STALE_PRS: {
    type: "NOTIFY_STALE_PRS",
    enabled: false,
    available: false,
    title: "Notify Stale PRs",
    shortDescription:
      "Send a Slack message when a Pull Request hasn't been reviewed or has been open for too long.",
    status: "soon" as const,
    color: "blue.1",
    icon: "🕵️‍♀️",
    benefits: {
      cycleTime: "1",
    },
  },
  CODE_FREEZE: {
    type: "CODE_FREEZE",
    enabled: false,
    available: false,
    title: "Code Freeze",
    shortDescription:
      "Big migration? Xmas break? Schedule a period where no PRs can be merged in selected repositories.",
    status: "soon" as const,
    color: "blue.1",
    icon: "🧊",
    benefits: {
      failureRate: "Avoid failure risks during code freeze.",
    },
  },
};

interface UseAutomationCards {
  automationCards: typeof automationCards;
  futureAutomations: (typeof automationCards)[keyof typeof automationCards][];
}

export const useAutomationCards = (): UseAutomationCards => {
  return {
    automationCards,
    futureAutomations: Object.values(automationCards).filter(
      (automation) => !automation.available,
    ),
  };
};

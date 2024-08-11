import { parseISO } from "date-fns";
import { getDaysLeft } from "./date.provider";
import { useWorkspace } from "./workspace.provider";
import {
  showWarningNotification,
  useNotifications,
} from "./notification.provider";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@mantine/core";
import { useSupportChat } from "../components/navbar/use-support-chat";
import { cleanNotifications } from "@mantine/notifications";

export const useBilling = () => {
  const { workspace } = useWorkspace();

  const subscription = workspace?.billing?.subscription;
  const hasInactiveSubscription = subscription?.isActive === false;

  return {
    subscription: workspace?.billing?.subscription,
    hasActiveSubscription: subscription?.isActive,
    hasInactiveSubscription,
  };
};

export const useTrial = () => {
  const { workspace } = useWorkspace();

  const trial = workspace?.billing?.trial;

  const daysLeft = trial ? getDaysLeft(parseISO(trial.endAt)) : null;
  const hasActiveTrial = daysLeft !== null && daysLeft > 0;

  return {
    trial,
    daysLeft,
    hasActiveTrial,
  };
};

export const usePaywall = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { findNotification } = useNotifications();
  const { openChat } = useSupportChat();
  const { hasInactiveSubscription } = useBilling();
  const { workspace } = useWorkspace();
  const shouldShowPaywall =
    !workspace.isActiveCustomer && pathname != "/settings/billing";

  const showPaywallNotification = () => {
    if (findNotification("paywall").length > 0) return;

    const messages = {
      trialEnded: {
        title: "Your trial period has expired.",
        message: "Please subscribe to continue using Sweetr.",
      },
      canceledSubscription: {
        title: "Your subscription was canceled.",
        message: "Please reach out to support to subscribe again.",
      },
    };

    showWarningNotification({
      key: "paywall",
      title: hasInactiveSubscription
        ? messages.canceledSubscription.title
        : messages.trialEnded.title,
      message: (
        <>
          {hasInactiveSubscription
            ? messages.canceledSubscription.message
            : messages.trialEnded.message}
          <Button
            display="block"
            mt="xs"
            variant="default"
            size="xs"
            onClick={() => {
              cleanNotifications();
              openChat();
            }}
          >
            Chat with support
          </Button>
        </>
      ),
      autoClose: false,
      withCloseButton: false,
    });
  };

  return {
    shouldShowPaywall,
    showPaywallNotification,
    goToPaywall: () => navigate("/settings/billing"),
  };
};

import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  getAuthorizationHeader,
  setAuth,
} from "../../../providers/auth.provider";
import { showErrorNotification } from "../../../providers/notification.provider";
import { useWorkspaceByInstallationIdQuery } from "../../../api/workspaces.api";
import { useAppStore } from "../../../providers/app.provider";

export const useGithubInstall = () => {
  const [searchParams] = useSearchParams();
  const installationId = searchParams.get("installation_id") || "";
  const oauthCode = searchParams.get("code") || "";
  const csrfToken = searchParams.get("state") || "";
  const { setWorkspace } = useAppStore();
  const hasLoggedIn = useRef(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorAtStep, setErrorAtStep] = useState<number | null>(null);
  const [cyclesInCurrentStep, setCyclesInCurrentStep] = useState(0);

  const { data, status, isError, isRefetching } =
    useWorkspaceByInstallationIdQuery(
      {
        gitInstallationId: installationId,
      },
      {
        enabled: !!installationId && currentStep !== 4 && hasLoggedIn.current,
        refetchInterval: 1000, // Query every second
      },
    );

  useEffect(() => {
    if (status !== "success" || currentStep === 4) return;

    const workspace = data?.workspaceByInstallationId;
    setCyclesInCurrentStep((cyclesInCurrentStep) => cyclesInCurrentStep + 1);

    if (currentStep === 3) {
      setCyclesInCurrentStep(0);
      setCurrentStep(4);

      return;
    }

    if (currentStep == 2 && workspace) {
      // Dirty workaround: If user has no repositories, we assume success after 3 refetches
      if (workspace?.repositories?.length || cyclesInCurrentStep > 2) {
        setWorkspace(workspace);
        setCyclesInCurrentStep(0);
        setCurrentStep(3);
      }

      return;
    }

    if (data?.workspaceByInstallationId?.id) {
      setCyclesInCurrentStep(0);
      setCurrentStep(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefetching, status]);

  useEffect(() => {
    if (!isError) return;
    setErrorAtStep(currentStep);

    showErrorNotification({
      title: "Error",
      message: "Something went wrong, please reinstall the GitHub app.",
      autoClose: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefetching, isError]);

  useEffect(() => {
    const accessToken = getAuthorizationHeader();

    if (!accessToken) {
      showErrorNotification({
        title: "Error",
        message: "Could not authenticate, please try again.",
      });
      return;
    }

    if (!hasLoggedIn.current) {
      hasLoggedIn.current = true;
      setAuth(accessToken);
      setCurrentStep(1);
      return;
    }
  }, [hasLoggedIn, oauthCode, csrfToken]);

  return {
    currentStep,
    workspace: data?.workspaceByInstallationId,
    errorAtStep,
  };
};

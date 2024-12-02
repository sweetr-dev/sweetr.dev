import { Flex, Paper, Progress, Stack } from "@mantine/core";
import { useCallback } from "react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLoginWithGithubMutation } from "../../../api/auth.api";
import { Logo } from "../../../components/logo";
import { setAuth } from "../../../providers/auth.provider";
import { showErrorNotification } from "../../../providers/notification.provider";
import { isGithubInstallSuccessCallback } from "../../../providers/github.provider";
import { forwardQueryParameters } from "../../../providers/url.provider";

const getRedirectUrl = (encodedUrl?: string) => {
  if (isGithubInstallSuccessCallback(new URL(window.location.href))) {
    const redirectTo = forwardQueryParameters(
      new URL("/github/install", window.location.origin),
    );

    return `${redirectTo.pathname}${redirectTo.search}`;
  }

  if (encodedUrl) return decodeURIComponent(encodedUrl);

  return "/";
};

export const OAuthGithubPage = () => {
  const [searchParams] = useSearchParams({
    code: "",
    state: "",
  });

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const stateEncodedUrl = state?.split(":::").at(0);
  const csrfToken = state?.split(":::").at(-1);
  const redirectUrl = getRedirectUrl(stateEncodedUrl);

  const navigate = useNavigate();

  document.body.style.backgroundColor = "#141517";

  const handleError = useCallback(() => {
    if (!csrfToken) {
      showErrorNotification({
        title: "Error",
        message:
          "Could not verify the request origin, please authenticate again.",
        autoClose: false,
      });
    } else {
      showErrorNotification({
        title: "Error",
        message: "Something went wrong, please try again.",
      });
    }

    if (isGithubInstallSuccessCallback(new URL(window.location.href))) {
      const installationId = searchParams.get("installation_id");

      navigate(
        `/login?redirectTo=${encodeURIComponent(`/github/install?installation_id=${installationId}`)}`,
      );
      return;
    }

    navigate("/");
  }, [navigate, csrfToken, searchParams]);

  const { data, error, isPending, mutate } = useLoginWithGithubMutation({
    onSuccess: (data) => {
      const accessToken = data.loginWithGithub.token.accessToken;

      setAuth(accessToken);

      navigate(redirectUrl);
    },
    onError: handleError,
  });

  useEffect(() => {
    if (code && csrfToken) {
      mutate({ input: { code, state: csrfToken } });
      return;
    }

    handleError();
  }, [code, csrfToken, redirectUrl, mutate, navigate, handleError]);

  return (
    <Flex mih="100vh" align="center" direction="column">
      <Stack mt={120} align="center">
        <Logo size={128} />
        <Paper withBorder mt={40} p="lg" w={260}>
          {(isPending || data) && (
            <Progress color="green" size="md" value={100} animated />
          )}
          {error && <>Invalid code, please try again.</>}
        </Paper>
      </Stack>
    </Flex>
  );
};

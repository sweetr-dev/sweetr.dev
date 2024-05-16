import Cookies from "js-cookie";
import { redirect } from "react-router-dom";
import { setAuthorizationHeader } from "../api/clients/graphql-client";
import { ClientError } from "graphql-request";
import { useAppStore } from "./app.provider";
import { ResourceNotFound } from "../exceptions/resource-not-found.exception";

export const useAuthenticatedUser = () => {
  const { authenticatedUser } = useAppStore();

  if (!authenticatedUser) {
    throw new ResourceNotFound();
  }

  return { user: authenticatedUser };
};

export const isAuthenticated = (): boolean => {
  return !!getAuthorizationHeader();
};

export const getAuthorizationHeader = (): string | undefined =>
  Cookies.get("Authorization");

export const setAuth = (accessToken: string): void => {
  Cookies.set("Authorization", accessToken, {
    domain: import.meta.env.VITE_AUTH_COOKIE_DOMAIN,
    secure: false,
  });

  setAuthorizationHeader(accessToken);
};

export const logout = (): void => {
  Cookies.remove("Authorization", {
    domain: import.meta.env.VITE_AUTH_COOKIE_DOMAIN,
    secure: false,
  });
};

export const redirectIfNoCredentials = () => {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    return redirect("/login");
  }

  setAuthorizationHeader(authorization);
  return null;
};

export const redirectIfCredentials = () => {
  if (isAuthenticated()) {
    return redirect("/");
  }

  return null;
};

export const isAuthError = (error: unknown) => {
  if (error instanceof ClientError) {
    return error.response.errors?.some(
      (error) => error.extensions.code === "UNAUTHENTICATED",
    );
  }

  return false;
};

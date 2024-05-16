import jwt from "jsonwebtoken";
import {
  ResolveUserFn,
  ValidateUserFn,
  useGenericAuth,
} from "@envelop/generic-auth";
import authConfig from "../../../../config/auth.config";
import { JWTPayload } from "../../services/auth.types";
import { YogaInitialContext } from "graphql-yoga";
import { setSentryUser } from "../../../../lib/sentry";
import { AuthenticationException } from "../../../errors/exceptions/authentication.exception";

/*
    This method runs every request
    It is responsible for validating authentication through JWT token
    and injecting the user to the context.

    See more at https://the-guild.dev/graphql/envelop/plugins/use-generic-auth
*/
const resolveUserFn: ResolveUserFn<JWTPayload, YogaInitialContext> = async (
  context
) => {
  const bearerToken = context.request.headers.get("Authorization");

  if (!bearerToken) return null;

  const accessToken = bearerToken.replace("Bearer ", "");

  try {
    const token = jwt.verify(accessToken, authConfig.jwt.secret) as JWTPayload;

    setSentryUser({ id: `${token.userId}` });

    return token;
  } catch {
    return null;
  }
};

const validateUser: ValidateUserFn<JWTPayload> = (params) => {
  // Don't validate when field has @skipAuth directive
  if (params.fieldAuthDirectiveNode?.name.value === "skipAuth") return;

  if (!params.user) {
    throw new AuthenticationException();
  }
};

export const authPlugin = useGenericAuth({
  resolveUserFn,
  validateUser,
  mode: "protect-all",
  contextFieldName: "currentToken",
});

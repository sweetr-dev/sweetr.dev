import { FastifyPluginAsync } from "fastify";
import { addJob, SweetQueue } from "../../bull-mq/queues";
import { validateInputOrThrow } from "../validator.service";
import { postDeploymentValidationSchema } from "./services/deployment.validation";
import { logger } from "../../lib/logger";
import {
  findApiKeyOrThrow,
  getBearerToken,
} from "../api-keys/services/api-keys.service";

export const deploymentsRouter: FastifyPluginAsync = async (fastify) => {
  fastify.post("/v1/deployments", async (request, reply) => {
    logger.debug("http.deployments.create", { body: request.body });

    const apiKey = await findApiKeyOrThrow(
      getBearerToken(request.headers.authorization)
    );

    const payload = await validateInputOrThrow(
      postDeploymentValidationSchema,
      request.body as never
    );

    await addJob(SweetQueue.DEPLOYMENT_TRIGGERED_BY_API, {
      workspaceId: apiKey.workspaceId,
      deployedAt: payload.deployedAt
        ? new Date(payload.deployedAt)
        : new Date(),
      ...payload,
    });

    return reply.code(202).send();
  });
};

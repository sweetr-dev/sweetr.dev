import { Router } from "express";
import { catchErrors } from "../../lib/express-helpers";
import { addJob, SweetQueue } from "../../bull-mq/queues";
import { validateInputOrThrow } from "../validator.service";
import { postDeploymentValidationSchema } from "./services/deployment.validation";
import { logger } from "../../lib/logger";
import { findApiKeyOrThrow } from "../api-keys/services/api-keys.service";

export const deploymentsRouter = Router();

deploymentsRouter.post(
  "/v1/deployments",
  catchErrors(async (req, res) => {
    logger.debug("http.deployments.create", { body: req.body });

    console.log(req.headers.authorization);
    const apiKey = await findApiKeyOrThrow(req.headers.authorization as string);

    const payload = await validateInputOrThrow(
      postDeploymentValidationSchema,
      req.body
    );

    await addJob(SweetQueue.DEPLOYMENT_CREATE, {
      workspaceId: apiKey.workspaceId,
      deployedAt: payload.deployedAt
        ? new Date(payload.deployedAt)
        : new Date(),
      ...payload,
    });

    return res.status(202).send();
  })
);

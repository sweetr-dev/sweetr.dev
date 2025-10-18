import { Router } from "express";
import { catchErrors } from "../../lib/express-helpers";
import { addJob, SweetQueue } from "../../bull-mq/queues";
import { validateInputOrThrow } from "../validator.service";
import { createDeploymentValidationSchema } from "./services/deployment.validation";
import { logger } from "../../lib/logger";
import { findApiKeyOrThrow } from "../api-keys/services/api-keys.service";

export const deploymentsRouter = Router();

deploymentsRouter.post(
  "/v1/deployments",
  catchErrors(async (req, res) => {
    logger.debug("http.deployments.create", { body: req.body });

    const apiKey = await findApiKeyOrThrow(req.headers.authorization as string);

    const payload = await validateInputOrThrow(
      createDeploymentValidationSchema,
      req.body
    );

    await addJob(SweetQueue.DEPLOYMENT_CREATE, {
      workspaceId: apiKey.workspaceId,
      ...payload,
    });

    return res.status(200).send();
  })
);

import { Router } from "express";
import { validateWebhook } from "./middlewares/validate-webhook.middleware";
import { enqueueGithubWebhook } from "./services/github-webhook.service";
import { catchErrors } from "../../lib/express-helpers";

export const githubRouter = Router();

githubRouter.post(
  "/github/webhook",
  validateWebhook,
  catchErrors(async (req, res) => {
    await enqueueGithubWebhook(req.get("X-GitHub-Event"), req.body);

    return res.status(200).send();
  })
);

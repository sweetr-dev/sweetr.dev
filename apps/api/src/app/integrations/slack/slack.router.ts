import { Router } from "express";
import { catchErrors } from "../../../lib/express-helpers";
import { validateWebhook } from "./middlewares/validate-webhook.middleware";
import { enqueueSlackWebhook } from "./services/slack-webhook.service";
import { escapeHtml } from "../../../lib/html";

export const slackRouter = Router();

slackRouter.post(
  "/slack/webhook",
  validateWebhook,
  catchErrors(async (req, res) => {
    if (req.body.type === "url_verification") {
      return res.send(escapeHtml(req.body.challenge));
    }

    if (req.body.event?.type) {
      await enqueueSlackWebhook(req.body.event?.type, req.body);
    }

    return res.status(200).send();
  })
);

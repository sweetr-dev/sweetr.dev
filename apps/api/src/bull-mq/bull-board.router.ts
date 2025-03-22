import { Router } from "express";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { queues } from "./queues";
import auth from "basic-auth";
import { env } from "../env";
import { rateLimit } from "express-rate-limit";

export const bullBoardRouter = Router();

if (env.BULLBOARD_PATH) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(env.BULLBOARD_PATH);

  createBullBoard({
    queues: Object.values(queues).map((queue) => new BullMQAdapter(queue)),
    serverAdapter: serverAdapter,
  });

  bullBoardRouter
    .use(
      env.BULLBOARD_PATH,
      rateLimit({
        windowMs: 60, // 15 minutes
        max: 200,
        message: "Too many requests, please try again later.",
      })
    )
    .use(
      env.BULLBOARD_PATH,
      (req, res, next) => {
        const user = auth(req);
        const username = env.BULLBOARD_USERNAME;
        const password = env.BULLBOARD_PASSWORD;

        if (!user || user.name !== username || user.pass !== password) {
          res.set("WWW-Authenticate", 'Basic realm="BullBoard"');
          return res.status(401).send("Authentication required.");
        }

        next();
      },
      serverAdapter.getRouter()
    );
}

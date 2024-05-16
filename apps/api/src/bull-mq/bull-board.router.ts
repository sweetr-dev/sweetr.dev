import { Router } from "express";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { queues } from "./queues";
import { isProduction } from "../env";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/bullboard");

createBullBoard({
  queues: Object.values(queues).map((queue) => new BullMQAdapter(queue)),
  serverAdapter: serverAdapter,
});

export const bullBoardRouter = Router();

bullBoardRouter.use(
  "/bullboard",
  (_req, _res, next) => {
    if (isProduction) next("Not available in production");

    return next();
  },
  serverAdapter.getRouter()
);

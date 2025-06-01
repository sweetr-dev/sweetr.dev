// import { Router } from "express";
// import { catchErrors } from "../../lib/express-helpers";
// import { findWorkspaceByApiKeyOrThrow } from "../api-keys/services/api-keys.service";
// import { validateInputOrThrow } from "../../lib/validate-input";
// import { z } from "zod";

// export const deploymentsRouter = Router();

// deploymentsRouter.post(
//   "/deployment",
//   catchErrors(async (req, res) => {
//     const apiKey = req.headers["Authorization"];

//     const workspace = await findWorkspaceByApiKeyOrThrow(apiKey);

//     validateInputOrThrow(
//       z.object({
//         version: z.string(),
//         environment: z.string().default("production"),
//         appName: z.string().optional(),
//         commitSha: z.string().optional(),
//         deployedAt: z.string().datetime().optional(),
//         fixVersion: z.boolean().optional(),

//         includedCommitShas: z.array(z.string()).optional(),
//         filePathFilter: z.string().optional(),
//       }),
//       req.body
//     );

//     console.log(workspace);

//     return res.status(200).send();
//   })
// );

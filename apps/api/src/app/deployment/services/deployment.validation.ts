import { z } from "zod";
import { STRING_INPUT_MAX_LENGTH } from "../../validator.service";

export const createDeploymentValidationSchema = z.object({
  repositoryFullName: z.string().max(STRING_INPUT_MAX_LENGTH),
  environment: z.string().max(STRING_INPUT_MAX_LENGTH),
  app: z.string().max(STRING_INPUT_MAX_LENGTH),
  sha: z.string().max(70),
  author: z.string().max(STRING_INPUT_MAX_LENGTH),
  deployedAt: z.string().datetime().pipe(z.coerce.date()).optional(),
  monorepoPath: z.string().max(STRING_INPUT_MAX_LENGTH).optional(),
});

export type CreateDeploymentInput = z.infer<
  typeof createDeploymentValidationSchema
>;

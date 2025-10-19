import { z } from "zod";
import { STRING_INPUT_MAX_LENGTH } from "../../validator.service";

export const createDeploymentValidationSchema = z.object({
  repositoryFullName: z.string().max(STRING_INPUT_MAX_LENGTH),
  environment: z.string().max(STRING_INPUT_MAX_LENGTH),
  app: z.string().max(STRING_INPUT_MAX_LENGTH),
  version: z.string().max(70),
  description: z.string().max(STRING_INPUT_MAX_LENGTH).optional(),
  author: z.string().max(STRING_INPUT_MAX_LENGTH).optional(),
  deployedAt: z.string().datetime().pipe(z.coerce.date()).optional(),
  monorepoPath: z.string().max(STRING_INPUT_MAX_LENGTH).optional(),
});

export type CreateDeploymentInput = z.infer<
  typeof createDeploymentValidationSchema
>;

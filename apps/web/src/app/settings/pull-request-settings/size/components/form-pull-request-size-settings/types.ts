import { z } from "zod";

export const PullRequestSizeSettings = z.object({
  workspaceId: z.string().min(1),
  settings: z.object({
    pullRequest: z.object({
      size: z
        .object({
          tiny: z.number().min(1),
          small: z.number().min(1),
          medium: z.number().min(1),
          large: z.number().min(1),
          ignorePatterns: z.array(z.string()),
        })
        .superRefine((size, ctx) => {
          if (size.small <= size.tiny) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Small must be greater than Tiny",
              path: ["small"],
            });
          }
          if (size.medium <= size.small || size.medium <= size.tiny) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Medium must be greater than Small and Tiny",
              path: ["medium"],
            });
          }
          if (
            size.large <= size.medium ||
            size.large <= size.small ||
            size.large <= size.tiny
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Large must be greater than Medium, Small, and Tiny",
              path: ["large"],
            });
          }
        }),
    }),
  }),
});

export type PullRequestSizeSettings = z.infer<typeof PullRequestSizeSettings>;

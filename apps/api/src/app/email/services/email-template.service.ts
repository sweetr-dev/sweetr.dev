import { InitialSyncCompleteEmail } from "@sweetr/email-templates";

export const emailTemplates = {
  InitialSyncCompleteEmail,
};

export type EmailTemplate = keyof typeof emailTemplates;

export type EmailTemplateProps = {
  [K in EmailTemplate]: React.ComponentProps<(typeof emailTemplates)[K]>;
};

export interface BuildEmailTemplate {
  type: EmailTemplate;
  props: EmailTemplateProps[EmailTemplate];
}

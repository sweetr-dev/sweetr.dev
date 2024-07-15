import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { sendEmail, SendEmailPayload } from "../services/send-email.service";
import { renderEmailTemplate } from "@sweetr/email-templates";
import {
  BuildEmailTemplate,
  emailTemplates,
} from "../services/email-template.service";

interface SendEmailJob {
  template: BuildEmailTemplate;
  payload: SendEmailPayload;
}

export const sendEmailWorker = createWorker(
  SweetQueue.SEND_EMAIL,
  async (job: Job<SendEmailJob>) => {
    const template = renderEmailTemplate(
      emailTemplates[job.data.template.type],
      job.data.template.props
    );

    await sendEmail({
      ...template,
      ...job.data.payload,
    });
  }
);

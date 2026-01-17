import { Job } from "bullmq";
import { SweetQueues, QueuePayload } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { sendEmail } from "../services/send-email.service";
import { renderEmailTemplate } from "@sweetr/email-templates";
import { emailTemplates } from "../services/email-template.service";

export const sendEmailWorker = createWorker(
  SweetQueues.SEND_EMAIL.name,
  async (job: Job<QueuePayload<"SEND_EMAIL">>) => {
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

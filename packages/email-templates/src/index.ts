import { ComponentType, createElement } from "react";
import { render } from "@react-email/render";

export { InitialSyncCompleteEmail } from "./emails/initial-sync-complete";

export const renderEmailTemplate = async <P extends {}>(
  component: ComponentType<P>,
  props: P
) => {
  const element = createElement(component, props);

  return {
    react: element,
    text: await render(element, { plainText: true }),
  };
};

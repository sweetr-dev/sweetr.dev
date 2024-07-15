import { ComponentType, createElement } from "react";
import { render } from "@react-email/render";

export { InitialSyncCompleteEmail } from "./emails/initial-sync-complete";

export const renderEmailTemplate = <P extends {}>(
  component: ComponentType<P>,
  props: P
) => {
  const element = createElement(component, props);

  return {
    react: element,
    text: render(element, { plainText: true }),
  };
};

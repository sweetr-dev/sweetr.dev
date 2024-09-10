import { useState } from "react";
import { showErrorNotification } from "../../../../../../providers/notification.provider";

export const useRegExValidation = () => {
  const [isValidRegEx, setIsValidRegEx] = useState<boolean | null>(null);
  const [isValidExample, setIsValidExample] = useState<boolean | null>(null);

  const validateRegEx = (updatedSettings: Record<string, any>) => {
    if (!updatedSettings.regex) return true;

    try {
      const regex = new RegExp(updatedSettings.regex);

      setIsValidRegEx(true);

      if (updatedSettings.regex && updatedSettings.regexExample) {
        const isValidExample = regex.test(updatedSettings.regexExample);

        setIsValidExample(isValidExample);

        if (!isValidExample) {
          showErrorNotification({
            message: "This example doesn't match the RegEx pattern",
          });
          return;
        }
      }
    } catch {
      setIsValidRegEx(false);

      showErrorNotification({
        message: "Invalid Regular Expression",
      });
    }

    return true;
  };

  return {
    isValidRegEx,
    isValidExample,
    validateRegEx,
  };
};

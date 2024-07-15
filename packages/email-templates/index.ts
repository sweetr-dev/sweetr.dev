import { promises as fs } from "fs";
import { join } from "path";

const templates = {
  initialSyncComplete: "initial-sync-complete",
};

interface Template {
  html: string;
  text: string;
}

export const getEmailTemplate = async (
  template: keyof typeof templates
): Promise<Template | null> => {
  try {
    const filename = templates[template];
    const html = await fs.readFile(
      join(__dirname, `/compiled/html/${filename}.html`),
      { encoding: "utf8" }
    );
    const text = await fs.readFile(
      join(__dirname, `/compiled/txt/${filename}.txt`),
      { encoding: "utf8" }
    );

    return {
      html,
      text,
    };
  } catch (error) {
    return null;
  }
};

import { KnownBlock, Block } from "@slack/web-api";

export interface SendAlertArgs {
  workspaceId: number;
  channel: string;
  blocks: (KnownBlock | Block)[];
  text: string;
}

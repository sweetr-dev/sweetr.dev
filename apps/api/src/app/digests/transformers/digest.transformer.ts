import {
  Digest as ApiDigest,
  DigestType,
  Frequency,
} from "@sweetr/graphql-types/dist/api";
import { Digest } from "../services/digest.types";

export const transformDigest = (digest: Digest): ApiDigest => {
  return {
    ...digest,
    enabled: digest.enabled || false,
    type: digest.type as DigestType,
    frequency: digest.frequency as Frequency,
    settings: digest.settings,
  };
};

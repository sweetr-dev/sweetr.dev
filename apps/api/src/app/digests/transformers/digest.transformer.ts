import {
  Digest as ApiDigest,
  DayOfTheWeek,
  DigestType,
  DigestFrequency,
} from "@sweetr/graphql-types/dist/api";
import { Digest } from "../services/digest.types";

export const transformDigest = (digest: Digest): ApiDigest => {
  return {
    ...digest,
    enabled: digest.enabled || false,
    type: digest.type as DigestType,
    frequency: digest.frequency as DigestFrequency,
    dayOfTheWeek: digest.dayOfTheWeek as DayOfTheWeek[],
    settings: digest.settings,
  };
};

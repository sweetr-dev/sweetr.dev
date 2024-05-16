import {
  DateTimeResolver,
  BigIntResolver,
  HexColorCodeResolver,
} from "graphql-scalars";
import { sweetIdResolver } from "./sweet-id.scalar";

export const scalarsResolver = {
  DateTime: DateTimeResolver,
  SweetID: sweetIdResolver,
  BigInt: BigIntResolver,
  HexColorCode: HexColorCodeResolver,
};

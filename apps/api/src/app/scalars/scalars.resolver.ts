import {
  DateTimeResolver,
  BigIntResolver,
  HexColorCodeResolver,
  JSONObjectResolver
  VoidResolver,
} from "graphql-scalars";
import { sweetIdResolver } from "./sweet-id.scalar";

export const scalarsResolver = {
  DateTime: DateTimeResolver,
  SweetID: sweetIdResolver,
  BigInt: BigIntResolver,
  HexColorCode: HexColorCodeResolver,
  JSONObject: JSONObjectResolver,
  Void: VoidResolver,
};

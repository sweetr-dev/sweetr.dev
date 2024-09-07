import {
  DateTimeResolver,
  BigIntResolver,
  HexColorCodeResolver,
  VoidResolver,
} from "graphql-scalars";
import { sweetIdResolver } from "./sweet-id.scalar";

export const scalarsResolver = {
  DateTime: DateTimeResolver,
  SweetID: sweetIdResolver,
  BigInt: BigIntResolver,
  HexColorCode: HexColorCodeResolver,
  Void: VoidResolver,
};

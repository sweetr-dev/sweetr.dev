import { GraphQLScalarType, Kind } from "graphql";
import { decodeId, encodeId } from "../../lib/hash-id";

export const sweetIdResolver = new GraphQLScalarType({
  name: "SweetID",
  description: "A sweet resource identifier",
  serialize(value: number) {
    return encodeId(value);
  },
  parseValue(value: string) {
    return decodeId(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return decodeId(ast.value);
    }

    return null;
  },
});

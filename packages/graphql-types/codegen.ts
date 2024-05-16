import type { CodegenConfig } from "@graphql-codegen/cli";
import { resolve } from "path";

const scalars = {
  JSON: "string",
  UUID: "string",
  Date: "string",
  DateTime: "string",
  BigInt: "bigint",
  HexColorCode: "string",
};

const config: CodegenConfig = {
  ignoreNoDocuments: true,
  noSilentErrors: true,
  schema: resolve(__dirname, "../../apps/**/*.schema.ts"),
  generates: {
    [resolve(__dirname, "api.ts")]: {
      plugins: [
        "typescript",
        "typescript-resolvers",
        { add: { content: "import { DeepPartial } from 'utility-types';" } },
      ],
      config: {
        contextType: "./shared#GraphQLContext",
        defaultMapper: "DeepPartial<{T}>",
        scalars: {
          ...scalars,
          SweetID: "number",
          BigInt: "bigint",
        },
      },
    },
    [__dirname + "/frontend/"]: {
      preset: "client",
      plugins: [],
    },
  },
  documents: [
    "./../../apps/web/**/*.api.ts",
    "./../../apps/api/**/*.schema.ts",
  ],
  config: {
    strictScalars: true,
    namingConvention: {
      typeNames: "change-case-all#pascalCase",
      enumValues: "change-case-all#upperCase",
    },
    scalars: {
      ...scalars,
      SweetID: "string",
      BigInt: "number",
    },
  },
};

export default config;

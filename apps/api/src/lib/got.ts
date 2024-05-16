// Work-around for ESM only library
// https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
// https://github.com/microsoft/TypeScript/issues/43329#issuecomment-1008361973
// https://github.com/microsoft/TypeScript/issues/43329#issuecomment-1315512792

export const getHttpClient = () =>
  import("got").then(({ default: got }) => {
    got.extend({
      timeout: {
        request: 10000, // Global 10 seconds timeout
      },
    });

    return got;
  });

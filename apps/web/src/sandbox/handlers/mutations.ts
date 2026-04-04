import { graphql, HttpResponse } from "msw";

export const mutationHandlers = [
  graphql.mutation(/.+/, ({ query }) => {
    return HttpResponse.json({
      data: {},
    });
  }),
];

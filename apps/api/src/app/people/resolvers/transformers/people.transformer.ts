import { GitProfile, User } from "@prisma/client";
import { Person } from "../../../../graphql-types";

export const transformPerson = (
  person: GitProfile & { user?: User | null }
): Omit<Person, "personalMetrics"> => {
  return {
    id: person.id,
    handle: person.handle,
    name: person.name,
    avatar: person.avatar,
    email: person.user?.email,
    teamMemberships: [],
    codeReviews: [],
    teammates: [],
  };
};

import { Person } from "../../../../graphql-types";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  findTeamMembershipsByGitProfile,
  findTeammatesByGitProfile,
} from "../../services/team.service";
import { transformTeamMember } from "../transformers/team-member.tranformer";

export const personTeamMembershipsQuery = createFieldResolver("Person", {
  teamMemberships: async (person: Person, _, context) => {
    logger.info("query.person.teamMemberships", { person });

    if (!person.id) {
      throw new ResourceNotFoundException("Person not found");
    }

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const memberships = await findTeamMembershipsByGitProfile(
      context.workspaceId,
      person.id
    );

    return memberships.map(transformTeamMember);
  },
  teammates: async (person: Person, _, context) => {
    logger.info("query.person.teammates", { person });

    if (!person.id) {
      throw new ResourceNotFoundException("Person not found");
    }

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const memberships = await findTeammatesByGitProfile(
      context.workspaceId,
      person.id
    );

    return memberships.map(transformTeamMember);
  },
});

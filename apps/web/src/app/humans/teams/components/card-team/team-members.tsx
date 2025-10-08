import { Avatar, AvatarGroupProps, Tooltip } from "@mantine/core";
import type { FC } from "react";
import { TeamMemberAvatar } from "./team-member-avatar";

type TeamMembersProps = Omit<AvatarGroupProps, "children"> & {
  members: {
    name: string;
    handle: string;
    avatar?: string;
  }[];
};

export const TeamMembers: FC<TeamMembersProps> = ({ members, ...props }) => {
  const showAmount = 3;
  const visibleMembers = members.slice(0, showAmount);
  const hiddenMembers = members.slice(showAmount);

  return (
    <Avatar.Group {...props}>
      {visibleMembers.map((member) => (
        <TeamMemberAvatar
          key={member.handle}
          name={member.name}
          src={member.avatar}
        />
      ))}

      {hiddenMembers.length > 0 && (
        <Tooltip
          label={
            <>
              {hiddenMembers.map((member) => (
                <div key={member.handle}>{member.name}</div>
              ))}
            </>
          }
          withArrow
        >
          <Avatar size={32} radius="xl">
            +{hiddenMembers.length}
          </Avatar>
        </Tooltip>
      )}
    </Avatar.Group>
  );
};

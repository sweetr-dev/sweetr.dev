import {
  Paper,
  Group,
  Stack,
  Title,
  Text,
  Tooltip,
  Anchor,
  HoverCard,
  PaperProps,
} from "@mantine/core";
import { IconFlame, IconMessage } from "@tabler/icons-react";
import { IconPullRequestState } from "../icon-pull-request-state";
import { Person, PullRequest } from "@sweetr/graphql-types/frontend/graphql";
import { LinesChanged } from "../lines-changed/lines-changed";
import { BadgePullRequestSize } from "../badge-pull-request-size/badge-pull-request-size";
import classes from "./card-pull-request.module.css";
import { getPullRequestChanges } from "../../providers/pull-request.provider";
import { usePrCard } from "./use-pr-card";
import { BadgeStatus } from "./badge-status";
import { BadgeData, useBadges } from "./use-badges";
import { TimelinePullRequest } from "./timeline-pull-request";
import { useScreenSize } from "../../providers/screen.provider";
import { AvatarUser } from "../avatar-user";

interface CardPullRequestProps extends Omit<PaperProps, "className"> {
  pullRequest: Omit<PullRequest, "author"> & {
    author: Pick<Person, "name" | "avatar">;
  };
  timeFormat?: "ago" | "relative";
}

export const CardPullRequest = ({
  pullRequest,
  timeFormat = "relative",
  ...props
}: CardPullRequestProps) => {
  const { isSmallScreen } = useScreenSize();
  const { getCommentFlameProps, getTimeLabel } = usePrCard(pullRequest);

  const { getCardColor, badges } = useBadges(pullRequest);

  const cardColor = getCardColor();

  const { timeLabel, timeTooltipLabel } = getTimeLabel(timeFormat);

  return (
    <HoverCard position="right" offset={5} withArrow>
      <HoverCard.Target>
        <Anchor
          href={pullRequest.gitUrl}
          underline="never"
          c="dark.0"
          target="_blank"
        >
          <Paper
            p="md"
            pl="lg"
            radius="md"
            withBorder
            className={`${classes.card} grow-on-hover`}
            style={{
              ["--borderWidth"]: cardColor ? "2px" : 0,
              ["--startColor"]: cardColor?.start,
              ["--endColor"]: cardColor?.end,
            }}
            {...props}
          >
            <Group
              justify="space-between"
              wrap={isSmallScreen ? "wrap" : "nowrap"}
            >
              <Group wrap="nowrap">
                <Stack gap="xs">
                  <Group gap="xs" wrap="nowrap">
                    <Title order={4} c="dark.3" textWrap="nowrap">
                      {pullRequest.repository.name}
                    </Title>
                    <Title order={4} lineClamp={1} title={pullRequest.title}>
                      {pullRequest.title}
                    </Title>
                  </Group>

                  <Group gap="xs">
                    <Group justify="center" align="center" gap={5}>
                      <IconPullRequestState state={pullRequest.state} />
                      <Tooltip
                        label={timeTooltipLabel}
                        withArrow
                        position="bottom"
                      >
                        <Text size="sm" c="dimmed">
                          {timeLabel}
                        </Text>
                      </Tooltip>
                    </Group>

                    {(
                      Object.values(badges).filter(
                        Boolean,
                      ) as NonNullable<BadgeData>[]
                    ).map((badge) => (
                      <BadgeStatus
                        key={badge.label}
                        variant={badge.variant}
                        icon={badge.icon}
                      >
                        {badge.label}
                      </BadgeStatus>
                    ))}
                  </Group>
                </Stack>
              </Group>

              <Group
                gap="xl"
                wrap="nowrap"
                justify={isSmallScreen ? "center" : "flex-end"}
              >
                {pullRequest.author && (
                  <AvatarUser
                    name={pullRequest.author.name}
                    src={pullRequest.author.avatar}
                    size={40}
                    tooltip
                  />
                )}

                <Group gap={5} miw={40} justify="flex-start" align="center">
                  {pullRequest.commentCount > 10 ? (
                    <IconFlame
                      stroke={1.5}
                      size={20}
                      {...getCommentFlameProps(pullRequest.commentCount)}
                    />
                  ) : (
                    <IconMessage stroke={1} size={20} />
                  )}

                  <Text size="md" fw={500}>
                    {pullRequest.commentCount}
                  </Text>
                </Group>

                <BadgePullRequestSize
                  size={pullRequest.tracking.size}
                  tooltip={
                    <LinesChanged {...getPullRequestChanges(pullRequest)} />
                  }
                />
              </Group>
            </Group>
          </Paper>
        </Anchor>
      </HoverCard.Target>
      <HoverCard.Dropdown bg="dark.7" w="auto" p={0}>
        <TimelinePullRequest pullRequest={pullRequest} />
      </HoverCard.Dropdown>
    </HoverCard>
  );
};

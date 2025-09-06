import { useDebouncedValue } from "@mantine/hooks";
import {
  Spotlight,
  SpotlightActionData,
  SpotlightActionGroupData,
} from "@mantine/spotlight";
import {
  IconBrandGithub,
  IconCircles,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useSpotlightQuery } from "../../api/spotlight.api";
import { Loader } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useContextualActionsStore } from "../../providers/contextual-actions.provider";
import { navItems } from "../../providers/nav.provider";

interface AppSpotlightProps {
  workspaceId: string;
}

export const AppSpotlight = ({ workspaceId }: AppSpotlightProps) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const navigate = useNavigate();
  const spotlightRef = useRef<HTMLDivElement>(null);
  const { actions: contextualActions } = useContextualActionsStore();

  const { data, isFetching } = useSpotlightQuery(
    {
      workspaceId,
      query: debouncedSearch,
    },
    {
      enabled: !!debouncedSearch,
    },
  );

  useEffect(() => {
    if (spotlightRef.current) {
      spotlightRef.current
        .querySelectorAll("[data-selected]")
        .forEach((option) => {
          option?.removeAttribute("data-selected");
        });

      spotlightRef.current
        .querySelector("button")
        ?.setAttribute("data-selected", "true");
    }
  }, [data]);

  const handleQueryChange = (query: string) => {
    setSearch(query);
  };

  const actions: (SpotlightActionGroupData | SpotlightActionData)[] = [
    {
      group: "Actions",
      actions: (Object.entries(contextualActions) || [])
        .map(([index, action]) => {
          const Icon = action.icon;

          return {
            ...action,
            id: index,
            leftSection: <Icon stroke={1.5} size={18} />,
          };
        })
        .filter((item) =>
          item.label?.toLowerCase().includes(search.toLowerCase().trim()),
        ),
    },
    {
      group: "Navigation",
      actions: [
        ...navItems.map((navItem) => {
          const Icon = navItem.icon;

          return {
            id: `nav-${navItem.label}`,
            label: navItem.label,
            description: `Navigate to ${navItem.label}`,
            leftSection: <Icon size={18} stroke={1.5} />,
            onClick: () => {
              navigate(navItem.href);
            },
          };
        }),
        {
          id: "nav-settings",
          label: "Settings",
          description: "Navigate to Settings",
          leftSection: <IconSettings size={18} stroke={1.5} />,
          onClick: () => {
            navigate("/settings");
          },
        },
      ].filter(
        (item) =>
          (item.label?.toLowerCase().includes(search.toLowerCase().trim()) ||
            item.description
              ?.toLowerCase()
              .includes(search.toLowerCase().trim())) &&
          search.length,
      ),
    },
    {
      group: "People",
      actions:
        data?.workspace.people.map((person) => ({
          id: `person-${person.id}`,
          label: person.name || person.handle,
          description: person.name ? person.handle : undefined,
          leftSection: <IconUsers size={18} stroke={1.5} />,
          onClick: () => {
            navigate(`/humans/people/${person.handle}`);
          },
        })) || [],
    },

    {
      group: "Teams",
      actions:
        data?.workspace.teams.map((team) => ({
          id: `team-${team.id}`,
          label: team.name,
          description: team.description,
          leftSection: <IconCircles size={18} stroke={1.5} />,
          onClick: () => {
            navigate(`/humans/teams/${team.id}`);
          },
        })) || [],
    },

    {
      group: "Repositories",
      actions:
        data?.workspace.repositories.map((repository) => ({
          id: `repository-${repository.id}`,
          label: repository.name,
          leftSection: <IconBrandGithub size={18} stroke={1.5} />,
          onClick: () => {
            if (window) {
              window
                .open(`https://github.com/${repository.fullName}`, "_blank")
                ?.focus();
            }
          },
        })) || [],
    },
  ];

  return (
    <Spotlight
      actions={actions}
      ref={spotlightRef}
      searchProps={{
        leftSection: <IconSearch size={18} />,
        rightSection: isFetching ? <Loader size={18} /> : undefined,
        placeholder: "Search...",
      }}
      shortcut="mod + K"
      nothingFound={isFetching ? undefined : "Nothing found"}
      query={search}
      filter={(_query, actions) => actions}
      onQueryChange={handleQueryChange}
    />
  );
};

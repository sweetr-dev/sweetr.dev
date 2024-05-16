import { Code, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { FC, useRef } from "react";
import type { TextInputProps } from "@mantine/core";
import { useOs } from "@mantine/hooks";
import { openSpotlight } from "@mantine/spotlight";
import classes from "./input-search.module.css";

type InputSearchProps = TextInputProps;

export const InputSearch: FC<InputSearchProps> = () => {
  const os = useOs();
  const inputElement = useRef<HTMLInputElement>(null);

  const shortcut = os === "macos" ? "⌘ + K" : "Ctrl + K";

  return (
    <TextInput
      ref={inputElement}
      placeholder="Search"
      size="sm"
      leftSection={<IconSearch size={12} stroke={1.5} />}
      rightSectionWidth={70}
      rightSection={<Code className={classes.searchCode}>{shortcut}</Code>}
      rightSectionPointerEvents="none"
      onFocus={() => {
        inputElement.current?.blur();
        openSpotlight();
      }}
    />
  );
};

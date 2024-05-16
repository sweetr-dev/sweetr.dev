import emojiData from "@emoji-mart/data";
import EmojiMart from "@emoji-mart/react";
import "./emoji-picker.css";

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

interface Emoji {
  id: string;
  keywords: string[];
  name: string;
  native: string;
  shortcodes: string;
  unified: string;
}

export const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  return (
    <EmojiMart
      data={emojiData}
      onEmojiSelect={(emoji: Emoji) => onChange(emoji.native)}
      previewPosition="none"
      skinTonePosition="search"
    />
  );
};

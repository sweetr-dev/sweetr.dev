"use client";
import { IconMessage } from "@tabler/icons-react";
import { Crisp } from "crisp-sdk-web";

interface ButtonContactUsProps {
  className?: string;
}

export const ButtonContactUs = ({ className = "" }: ButtonContactUsProps) => {
  return (
    <button
      className="btn border border-dark-400  text-dark-100 w-full shadow"
      onClick={() => {
        Crisp.chat.open();
      }}
    >
      <div className="flex items-center gap-2">
        <IconMessage size={18} stroke={1.5} /> Book a demo
      </div>
    </button>
  );
};

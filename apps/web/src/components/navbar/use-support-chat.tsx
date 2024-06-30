"use client";

import { useEffect, useState } from "react";
import { Crisp } from "crisp-sdk-web";

export const useSupportChat = () => {
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    Crisp.configure("41518479-f2b4-481b-8841-c3a8c3a9ba34");
    Crisp.chat.hide();

    Crisp.chat.onChatClosed(() => {
      Crisp.chat.hide();
      setOpen(false);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      Crisp.chat.show();
      Crisp.chat.open();
    }
  }, [isOpen]);

  return {
    openChat: () => setOpen(true),
  };
};

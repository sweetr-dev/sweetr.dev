"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export default () => {
  useEffect(() => {
    Crisp.configure("41518479-f2b4-481b-8841-c3a8c3a9ba34");
  });

  return null;
};

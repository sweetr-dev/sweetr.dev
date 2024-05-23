"use client";

import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import dynamic, { Loader } from "next/dynamic";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const CrispChat = dynamic(() => import("../../components/crisp-chat"));

  return (
    <>
      <Header />
      <CrispChat />

      <main className="grow">{children}</main>
      <Footer />
    </>
  );
}

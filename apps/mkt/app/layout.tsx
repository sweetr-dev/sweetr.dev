import "./css/style.css";

import { Inter, Inter_Tight } from "next/font/google";
import dynamic, { Loader } from "next/dynamic";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const inter_tight = Inter_Tight({
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata = {
  title: "sweetr.dev",
  description: "The platform for productivity and DX",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const CrispChat = dynamic(() => import("../components/crisp-chat"));
  const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;

  return (
    <html lang="en">
      {analyticsId && (
        <Script
          async
          src="https://analytics.umami.is/script.js"
          data-website-id={analyticsId}
        />
      )}
      <CrispChat />
      <body
        className={`${inter.variable} ${inter_tight.variable} font-inter antialiased bg-white text-zinc-900 tracking-tight`}
      >
        <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
          {children}
        </div>
      </body>
    </html>
  );
}

import "./css/style.css";

import { Inter, Inter_Tight } from "next/font/google";
import dynamic, { Loader } from "next/dynamic";
import Script from "next/script";
import { Metadata } from "next";

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

export const metadata: Metadata = {
  title: "sweetr.dev",
  description:
    "The developer platform for continuous improvement. Enable your software engineering teams to optimize and speed up development while improving developer experience.",
  openGraph: {
    title: "Sweetr - The developer platform for continuous improvement",
    description:
      "Enable your software engineering teams to optimize and speed up development while improving developer experience. Self-host for free or try a 14-day trial.",
    url: "https://sweetr.dev",
    siteName: "sweetr.dev",
    images: [
      {
        url: "https://sweetr.dev/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "sweetr.dev",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "sweetr.dev",
    description: "The developer platform for continuous improvement",
    images: ["https://sweetr.dev/images/og-image.png"],
  },
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
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "pe79341baq");
        `}
      </Script>
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

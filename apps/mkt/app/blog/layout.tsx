import Header from "@/components/ui/header";
import "../css/style.css";
import Footer from "@/components/ui/footer";
import { Inter, Inter_Tight } from "next/font/google";

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
  title: "Sweetr Blog",
  description: "How to improve engineering teams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${inter_tight.variable} bg-dark-800 font-inter antialiased text-zinc-900 tracking-tight`}
      >
        <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
          <Header />

          <main className="grow pt-[56px]">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

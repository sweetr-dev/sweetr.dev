import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/images/logo.svg";
import { useEffect, useState } from "react";
import { Lexend } from "next/font/google";
import { IconBrandGithub } from "@tabler/icons-react";

const lexendFont = Lexend({ subsets: ["latin"] });

export default function Header() {
  const [offset, setOffset] = useState(0);
  const onScroll = () => setOffset(window.scrollY);

  useEffect(() => {
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 shadow-[0_1px_0_0_#373a40] backdrop-blur-xl px-4 md:px-0`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between h-14 ">
          {/* Site branding */}
          <div className="shrink-0">
            {/* Logo */}
            <Link className="flex items-center justify-center gap-2" href="/">
              <Image src={Logo} width={24} height={24} alt="Logo" />
              <h1 className={`text-white ${lexendFont.className}`}>
                sweetr.dev
              </h1>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="flex grow">
            {/* Desktop sign in links */}
            <ul className="flex grow justify-end flex-wrap items-center">
              <li>
                <Link
                  className="text-sm font-medium text-zinc-300 hover:text-white px-3 lg:px-5 py-2 flex items-center transition"
                  href="https://app.sweetr.dev"
                >
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  className="text-sm font-medium text-zinc-300 hover:text-white px-3 lg:px-5 py-2 flex items-center transition"
                  href="https://docs.sweetr.dev"
                  target="_blank"
                >
                  Docs
                </Link>
              </li>
              <li className="hidden md:block">
                <Link
                  className="text-sm font-medium text-zinc-300 hover:text-white px-3 lg:px-5 py-2 flex items-center transition"
                  href="https://github.com/sweetr-dev/sweetr.dev"
                  target="_blank"
                  rel="nofollow"
                >
                  <div className="p-2 hover:scale-110">
                    <IconBrandGithub
                      stroke={1.5}
                      className="text-zinc-200"
                      size={22}
                    />
                  </div>
                </Link>
              </li>
              <li className="ml-1">
                <Link
                  className="btn text-white bg-zinc-900  w-full border-dark-400 shadow"
                  href="#pricing"
                >
                  Get started
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

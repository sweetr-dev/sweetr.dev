import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/images/logo.svg";
import { IconBrandLinkedin, IconBrandX } from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer className="bg-dark-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-0">
        {/* Top area: Blocks */}
        <div className="grid sm:grid-cols-12 gap-8 py-8 md:py-12">
          {/* 1st block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-6 max-sm:order-1 flex flex-col">
            <div className="mb-4">
              {/* Logo */}
              <div className="flex items-center justify-center w-8 h-8">
                <Image src={Logo} width={24} height={24} alt="Logo" />
              </div>
            </div>
            <div className="grow text-sm text-zinc-500">
              &copy; sweetr.dev. All rights reserved.
            </div>
            {/* Social links */}
            <ul className="flex space-x-2 mt-4 mb-1">
              <li>
                <a
                  target="_blank"
                  href="https://www.linkedin.com/company/sweetr-dev"
                  className="text-zinc-500 hover:text-blue-600"
                  aria-label="LinkedIn"
                >
                  <IconBrandLinkedin stroke={1.5} />
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://twitter.com/sweetr_dev"
                  className="text-zinc-500 hover:text-white"
                  aria-label="X (Twitter)"
                >
                  <IconBrandX stroke={1.5} />
                </a>
              </li>
            </ul>
          </div>

          {/* 2nd block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2"></div>

          {/* 3rd block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h4 className="text-sm text-dark-100 font-medium mb-2">
              Resources
            </h4>
            <ul className="text-sm space-y-2">
              <li>
                <a
                  className="text-zinc-500 hover:text-dark-100 transition"
                  href="https://docs.sweetr.dev"
                  target="_blank"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  className="text-zinc-500 hover:text-dark-100 transition"
                  href="https://sweetr.featurebase.app/changelog"
                  target="_blank"
                  rel="nofollow"
                >
                  Changelog
                </a>
              </li>
              <li>
                <a
                  className="text-zinc-500 hover:text-dark-100 transition"
                  href="https://sweetr.featurebase.app/roadmap"
                  target="_blank"
                  rel="nofollow"
                >
                  Roadmap
                </a>
              </li>
              <li>
                <a
                  className="text-zinc-500 hover:text-dark-100 transition"
                  href="https://status.sweetr.dev"
                  target="_blank"
                  rel="nofollow"
                >
                  System status
                </a>
              </li>
            </ul>
          </div>

          {/* 4th block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h4 className="text-sm text-dark-100 font-medium mb-2">Legal</h4>
            <ul className="text-sm space-y-2">
              <li>
                <a
                  className="text-zinc-500 hover:text-dark-100 transition"
                  href="https://github.com/sweetr-dev/sweetr.dev/blob/main/LICENSE"
                  target="_blank"
                  rel="nofollow"
                >
                  License
                </a>
              </li>
              <li>
                <a
                  className="text-zinc-500 hover:text-dark-100 transition"
                  href="/privacy-policy"
                  target="_blank"
                >
                  Privacy policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

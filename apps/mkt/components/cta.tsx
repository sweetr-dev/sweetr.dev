import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/images/logo.svg";
import Particles from "./automation-carousel/particles";

export default function Features02() {
  return (
    <section className="bg-dark-800 relative border-b border-dark-400 py-12 md:pt-20 px-4">
      <Particles
        className="absolute inset-0 z-0 opacity-40 group-hover/slide:opacity-100"
        quantity={30}
        rgb="105, 219, 124"
        refresh={true}
      />
      <div className="max-w-6xl mx-auto px-4 py-20 bg-dark-700 sm:px-6 md:px-0 border rounded-lg border-dark-400 ">
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-28 h-28 border-t border-dark-400 bg-dark-800 rounded-full shadow-lg mb-8 relative before:absolute before:-top-12 before:w-52 before:h-52 before:bg-zinc-900 before:opacity-[.08] before:rounded-full before:blur-3xl before:-z-10  shadow-green-400/30">
            <Link href="/">
              <Image src={Logo} width={60} height={60} alt="Logo" />
            </Link>
          </div>
          <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-white mb-4">
            Get started in under 30 seconds.
          </h2>
          <p className="text-lg text-dark-100 mb-8 max-w-lg mx-auto">
            Connect your GitHub organization now and start a new cycle of
            improvement in your engineering organization.
          </p>
          <div className="max-w-xs mx-auto sm:max-w-none sm:inline-flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <a
                className="btn text-black bg-green-400 hover:scale-105 w-full text-[16px] shadow-lg shadow-green-300/20"
                href="https://github.com/apps/sweetr-dev/installations/new"
                target="_blank"
                rel="nofollow"
              >
                Try for free
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/images/logo.svg";
import Particles from "./automation-carousel/particles";

export default function Features02() {
  return (
    <section className="bg-dark-800 relative border-b border-dark-400 py-12 md:py-20 px-4 bg-[url('/images/bg-shades.svg')] bg-[position:bottom] bg-[length:100%_80%] bg-no-repeat">
      <Particles
        className="absolute inset-0 z-0 opacity-40 group-hover/slide:opacity-100"
        quantity={80}
        rgb="105, 219, 124"
        refresh={true}
      />
      <div className="relative max-w-6xl mx-auto px-4 py-24 bg-dark-800 sm:px-6 md:px-0 border rounded-lg border-dark-400">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center rounded-full mb-8">
            <Link href="/">
              <Image src={Logo} width={60} height={60} alt="Logo" />
            </Link>
          </div>
          <h2 className="block w-fit-content mx-auto rounded font-inter-tight text-3xl md:text-4xl font-bold text-white mb-4 bg-dark-800">
            Get started in under 30 seconds
          </h2>
          <p className="text-lg text-dark-100 mb-8 max-w-lg mx-auto bg-dark-800 rounded">
            Connect your GitHub organization now and start a new cycle of
            improvement in your engineering organization.
          </p>
          <div className="max-w-xs mx-auto sm:max-w-none sm:inline-flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <a
                className="btn text-black bg-green-400 hover:scale-105 w-full text-[16px] shadow-xl shadow-green-300/20"
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

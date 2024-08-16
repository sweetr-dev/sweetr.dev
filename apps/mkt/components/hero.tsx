import Link from "next/link";
import { HeroVideo } from "./hero-video";
import Image from "next/image";
import Particles from "./automation-carousel/particles";

export default async function Hero() {
  const repo = "sweetr-dev/sweetr.dev";
  const response = await fetch(`https://api.github.com/repos/${repo}`, {
    next: { revalidate: 3600 },
  });
  const data = await response.json();

  const stars = data?.stargazers_count;
  const starsString =
    stars > 1000 ? `${Math.round(stars / 1000)}k` : `${stars}`;

  return (
    <div>
      <section className="bg-dark-800 relative before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-zinc-100 before:-z-10">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20 relative">
          <Particles
            className="absolute inset-0 z-0 opacity-40 -mt-20 group-hover/slide:opacity-100"
            quantity={100}
            rgb="105, 219, 124"
            refresh={true}
          />
          {/* Section content */}
          <div className="px-4 sm:px-6 md:px-0">
            <div className="mx-auto relative">
              <div className="text-center pb-12 md:pb-16 z-10">
                <h1 className="font-inter-tight text-4xl md:text-5xl font-bold bg-clip-text text-transparent text-white pb-4">
                  The dev-first platform for <br />{" "}
                  <em
                    className={`italic flex relative justify-center items-center text-green-400`}
                  >
                    continuous improvement
                  </em>
                </h1>
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-lg text-dark-100 mb-8">
                    Enable your software engineering teams to optimize and speed
                    up development while improving developer experience.
                  </h2>
                </div>
                <div className="max-w-xs mx-auto sm:max-w-none sm:inline-flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div>
                    <Link
                      className="btn text-white w-full border-dark-400  shadow-md shadow-[rgba(255,255,255,0.05)]"
                      href={`https://github.com/${repo}`}
                      target="_blank"
                      rel="nofollow"
                    >
                      <div className="flex gap-[4px] items-center">
                        <Image
                          src="/images/star.png"
                          height={16}
                          width={16}
                          alt="Star"
                        />{" "}
                        on GitHub
                      </div>
                      {stars && (
                        <div className="inline ml-2 px-2 bg-zinc-800 text-[10px] rounded-full">
                          {starsString}
                        </div>
                      )}
                    </Link>
                  </div>
                  <div>
                    <a
                      className="btn text-green-400  font-semibold border-green-400  w-full shadow-md shadow-green-300/20"
                      href="#pricing"
                    >
                      Get started for free
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Image */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative before:absolute before:-top-12 before:w-96 before:h-96 before:bg-zinc-900 before:opacity-[.15] before:rounded-full before:blur-3xl before:-z-10">
            <HeroVideo />
          </div>
        </div>
      </section>
    </div>
  );
}

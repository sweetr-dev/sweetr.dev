import {
  IconClipboardData,
  IconMessageDown,
  IconMessageExclamation,
  IconSeeding,
  IconUserPentagon,
} from "@tabler/icons-react";
import { IconEyeClosed, IconCode, IconInfinity } from "@tabler/icons-react";

export default function ProblemStatements() {
  const challenges = [
    {
      icon: (
        <IconEyeClosed
          size={64}
          stroke={0.5}
          className="text-red-500 mx-auto"
        />
      ),
      title: "Lack of visibility",
      description: "Scattered data make it hard to measure impact.",
    },
    {
      icon: (
        <IconCode size={64} stroke={0.5} className="text-red-500 mx-auto" />
      ),
      title: "Slow output",
      description: "Hidden bottlenecks slow down development.",
    },
    {
      icon: (
        <IconInfinity size={64} stroke={0.5} className="text-red-500 mx-auto" />
      ),
      title: "Low predictability",
      description: "It's hard to understand the team's flow.",
    },
    {
      icon: (
        <IconUserPentagon
          size={64}
          stroke={0.5}
          className="text-red-500 mx-auto"
        />
      ),
      title: "Inconsistent feedback",
      description: "Struggle to coach and mentor the team.",
    },
  ];

  return (
    <section className=" bg-dark-800 border-t border-dark-400">
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-0">
          <div className="relative max-w-3xl mx-auto text-center pb-12 md:pb-12">
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-white mb-4">
              The problems
            </h2>
            <h3 className="text-lg text-red-400">
              Faced by engineering managers and leadership.
            </h3>
          </div>
          <div className="flex flex-wrap">
            {challenges.map((challenge, index) => (
              <div key={index} className="w-full md:w-1/2 lg:w-1/2 px-4 mb-8">
                <div
                  className="py-12 rounded-lg border border-red-400/50 shadow-md text-center bg-dark-900"
                  style={{
                    background:
                      "linear-gradient(151deg, rgba(248,113,113,0.15) 0%, rgba(20,21,23,1) 30%, rgba(20,21,23,1) 70%, rgba(248,113,113,0.15) 100%)",
                  }}
                >
                  {challenge.icon}
                  <h3 className="mt-2 text-xl font-semibold text-black bg-red-400 px-3 inline-block rounded">
                    {challenge.title}
                  </h3>
                  <p className="mt-4 text-dark-100 px-2">
                    {challenge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

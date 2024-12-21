import { IconMessageReport } from "@tabler/icons-react";
import { IconCode, IconInfinity } from "@tabler/icons-react";

export default function ProblemStatements() {
  const challenges = [
    // {
    //   icon: (
    //     <IconEyeClosed
    //       size={64}
    //       stroke={0.5}
    //       className="text-red-500 mx-auto"
    //     />
    //   ),
    //   title: "Lack of visibility",
    //   description: "Scattered data make it hard to measure impact.",
    // },
    {
      icon: (
        <IconCode size={64} stroke={0.5} className="text-red-500 mx-auto" />
      ),
      title: "Slow output",
      description: "Hidden bottlenecks slow down development.",
    },
    {
      icon: (
        <IconMessageReport
          size={64}
          stroke={0.5}
          className="text-red-500 mx-auto"
        />
      ),
      title: "Poor feedback",
      description: "Struggle to coach and mentor the team.",
    },
    {
      icon: (
        <IconInfinity size={64} stroke={0.5} className="text-red-500 mx-auto" />
      ),
      title: "Low predictability",
      description: "Deadlines are often missed.",
    },
  ];

  return (
    <section className=" bg-dark-800 border-t border-dark-400">
      <div className="py-12 md:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-0">
          <div className="relative pb-12 md:pb-12">
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-white mb-4">
              The success & growth{" "}
              <em className="border-b-2 border-dashed border-b-red-400 text-red-400">
                killers
              </em>
            </h2>
            <h3 className="text-lg text-dark-100">
              Faced by engineering leaders and their teams.
            </h3>
          </div>
          <div className="flex flex-wrap lg:flex-nowrap gap-4">
            {challenges.map((challenge, index) => (
              <div key={index} className="w-full lg:w-1/3">
                <div
                  className="py-12 rounded-lg border border-red-400/20 shadow-md text-center bg-dark-900"
                  style={{
                    background:
                      "linear-gradient(165deg, rgba(248,113,113,0.15) 0%, rgba(20,21,23,1) 30%, rgba(20,21,23,1) 70%, rgba(248,113,113,0.15) 100%)",
                  }}
                >
                  {challenge.icon}
                  <h3 className="mt-4 text-xl font-semibold text-black bg-red-400 px-3 inline-block rounded">
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

import { AutomationCarousel } from "./automation-carousel";

export default function FeaturesAutomations() {
  return (
    <section className="relative bg-dark-800 border-t border-dark-400">
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-0">
          <div className="max-w-6xl mx-auto text-center pb-12">
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-white mb-4">
              Automations for developers
            </h2>
            <h3 className="text-lg text-dark-100">
              Configurable no-code routines to improve productivity and
              developer experience.
            </h3>
          </div>
          <div>
            <AutomationCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}

import { Lightbox } from "../lightbox/lightbox";
import { FeatureCta } from "./components/feature-cta";
import PrFlowImage from "@/public/images/features/pr-flow.png";
import PrFlow2Image from "@/public/images/features/pr-flow-2.png";

export const FeaturePrFlow = () => {
  return (
    <div className="prose pb-4">
      <h4 className="feature-heading">Pull Request Flow</h4>
      <p>How work moves through your team, from first commit to merge.</p>

      <Lightbox slides={[PrFlowImage, PrFlow2Image]} />

      <h5 className="h2">What you get</h5>
      <ul className="not-prose benefit-list">
        <li>PR throughput per week: opened vs merged vs closed.</li>
        <li>PR size distribution with average lines changed.</li>
        <li>
          Cycle time broken down by coding, first review, approval, and merge.
        </li>
        <li>PR size vs cycle time, to see where big PRs hurt flow.</li>
        <li>
          Team-by-team breakdown: median cycle time, merged PRs, avg PR size,
          and % of large PRs.
        </li>
      </ul>

      <h5 className="h2">Use it to</h5>
      <ul className="not-prose benefit-list">
        <li>Catch weeks where PRs pile up faster than they ship.</li>
        <li>
          Find the stage that slows delivery: coding, review, approval, or
          merge.
        </li>
        <li>Check if the team is shipping small, reviewable PRs.</li>
        <li>Measure how process changes move cycle time.</li>
        <li>Ground retros and planning in real delivery data.</li>
        <li>Compare flow across teams to know where to focus next.</li>
      </ul>

      <FeatureCta sandboxPath="/metrics-and-insights/pr-flow" />
    </div>
  );
};

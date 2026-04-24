import { Lightbox } from "../lightbox/lightbox";
import { FeatureCta } from "./components/feature-cta";
import CodeReviewDistributionImage from "@/public/images/features/code-review-distribution.png";
import CodeReviewQualityImage from "@/public/images/features/code-review-quality.png";
import CodeReviewSpeedImage from "@/public/images/features/code-review-speed.png";

export const FeatureCodeReviewEfficiency = () => {
  return (
    <div className="prose pb-4">
      <h4 className="feature-heading">Code Review Efficiency</h4>
      <p>How your team reviews code: who's involved, how fast, and how deep.</p>

      <Lightbox
        slides={[
          CodeReviewDistributionImage,
          CodeReviewQualityImage,
          CodeReviewSpeedImage,
        ]}
      />

      <h5 className="h2">What you get</h5>
      <ul className="not-prose benefit-list">
        <li>A map of who reviews whose code across the team.</li>
        <li>
          Split between reviews for your team and reviews for other teams.
        </li>
        <li>
          Time to first review and time to approval, trending week by week.
        </li>
        <li>PR size vs comments, to spot PRs that overwhelm reviewers.</li>
        <li>
          Team-by-team breakdown of review speed and merges without approval.
        </li>
      </ul>

      <h5 className="h2">Use it to</h5>
      <ul className="not-prose benefit-list">
        <li>Rebalance review load when a few people carry most of it.</li>
        <li>
          Break silos when reviewers only work with the same handful of people.
        </li>
        <li>See how much time your team spends reviewing other teams' code.</li>
        <li>Tell if reviews are getting faster after a process change.</li>
        <li>Catch PRs merging without approval before it becomes a habit.</li>
        <li>Compare review speed across teams to see who needs support.</li>
        <li>Bring real data into 1:1s and retros.</li>
      </ul>

      <FeatureCta sandboxPath="/metrics-and-insights/code-review-efficiency" />
    </div>
  );
};

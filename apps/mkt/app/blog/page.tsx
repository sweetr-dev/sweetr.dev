import { IconRobot, IconRobotFace } from "@tabler/icons-react";
import { CategoryNav } from "./components/category-nav";
import { NextRequest } from "next/server";

export default function Blog() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-0">
      <div className="pt-20 text-center">
        <h1 className="text-white text-4xl font-bold">
          The Sweetr <span className="text-green-400">Blog</span>
        </h1>
        <p className="text-dark-100 text-lg mt-4">
          Read our latest articles and insights on how to improve your
          engineering organization.
        </p>
      </div>

      <CategoryNav />
    </div>
  );
}

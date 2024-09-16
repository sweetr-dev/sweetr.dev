import { IconRobot, IconRobotFace } from "@tabler/icons-react";
import { CategoryNav } from "./components/category-nav";
import { NextRequest } from "next/server";

export default function Blog() {
  return (
    <div
      style={{
        backgroundImage: `
          linear-gradient(to bottom,
            #141517 0%,
            #141517 30%,
            rgba(20, 21, 23, 0.7) 40%,
            rgba(20, 21, 23, 0.4) 60%,
            rgba(20, 21, 23, 0.1) 80%,
            transparent 100%
          ),
          url('/images/blog/bg.svg')
        `,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundAttachment: "fixed",
      }}
    >
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

        <div className="pt-16 pb-32 grid grid-cols-1 gap-6">
          {/* Placeholder content for the grid items */}
          {[...Array(3)].map((_, index) => (
            <a
              href="#"
              key={index}
              className="hover:scale-105 transition-all border border-dark-400 rounded-md bg-dark-800 mx-auto"
            >
              <div className="p-4 flex flex-row justify-between items-center gap-12 flex-wrap">
                <div>
                  <div className="relative w-full md:w-[400px]">
                    <img
                      src="https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                      className="rounded w-full h-full object-cover"
                      alt="Blog post image"
                    />
                    <div
                      className="absolute inset-0 rounded"
                      style={{
                        backgroundImage: `
                          radial-gradient(
                            circle at center,
                            rgba(0, 0, 0, 0) 0%,
                            rgba(0, 0, 0, 0.3) 70%,
                            rgba(0, 0, 0, 0.7) 100%
                          )
                        `,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="max-w-[400px]">
                  <div className="flex items-center gap-2">
                    <div className="bg-dark-800 text-green-400 text-sm font-semibold uppercase tracking-[3px]">
                      Leadership
                    </div>
                  </div>
                  <h3 className="text-zinc-300 text-lg font-semibold mt-4">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting
                  </h3>
                  <div className="text-dark-100 text-sm mt-2 line-clamp-3">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s, when an unknown
                    printer took a galley of type and scrambled it to make a
                    type specimen book.
                  </div>
                  <div className="flex mt-6 items-center gap-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                      className="rounded-full"
                      height={48}
                      width={48}
                    />
                    <div className="flex flex-col text-zinc-400 font-semibold">
                      <div className="text-sm">Walter Galvão</div>
                      <div className="text-xs">September 14th, 2024</div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

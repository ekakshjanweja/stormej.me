import { Strongify } from "@/components/strongify";
import { ProjectRow } from "../_components/project-row";
import { WorkExRow } from "../_components/workex-row";
import { OpenSourceAndCommunityWorkRow } from "../_components/open-source-community-work-row";
import Link from "next/link";
import { Spotlight } from "@/components/ui/spotlight";

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const HomePage = () => {
  const blogDirectory = path.join(process.cwd(), "blogs");
  const fileNames = fs.readdirSync(blogDirectory);

  const blogs = fileNames.map((fileName) => {
    const slug = fileName.replace(".mdx", "");
    const fullPath = path.join(blogDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const { data: frontMatter } = matter(fileContents);

    const date = new Date(frontMatter.date);

    // Format the date to a readable string format
    // For example, "October 1, 2021"
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      slug,
      formattedDate,
      meta: frontMatter,
    };
  });

  return (
    <>
      {/* <Spotlight className="-top-40 md:-top-96" fill="#e7e5e4" /> */}
      <div>
        <p className="text-muted-foreground text-lg">
          Hello, I&#39;m
          <Strongify text={" Ekaksh Janweja"} />
          aka
          <Strongify text={"stormej."} />I am in my pre-final year in DTU
          studying engineering. I like
          <Strongify text={" building things "} />
          and
          <Strongify text={" lifting weights "} />
          (maybe some casual
          <Strongify text={" valorant "} />
          too).
        </p>
      </div>
      <WorkExRow />
      <ProjectRow />
      <OpenSourceAndCommunityWorkRow />

      <ul className="flex flex-col gap-4">
        {blogs.map((blog) => (
          <li key={blog.slug} className="border px-3 py-2 rounded-xl">
            <Link href={`/blog/${blog.slug}`}>
              <h3 className="font-bold text-xl">{blog.meta.title}</h3>
              <div>{blog.formattedDate}</div>
              <div>{blog.meta.description}</div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default HomePage;

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.stormej.me",
  generateRobotsTxt: false,
  exclude: ["/api/*", "/og", "/og/*", "/llms.txt"],
  changefreq: "weekly",
  priority: 0.7,
  transform: async (config, path) => {
    let priority = 0.7;
    let changefreq = "weekly";
    if (path === "/") {
      priority = 1.0;
      changefreq = "weekly";
    } else if (path === "/work" || path === "/projects" || path === "/blog") {
      priority = 0.9;
    } else if (
      path.startsWith("/work/") ||
      path.startsWith("/projects/") ||
      path.startsWith("/blog/")
    ) {
      priority = 0.8;
    } else if (path === "/gear") {
      priority = 0.5;
    }
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};

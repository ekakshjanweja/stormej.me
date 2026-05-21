import { docs, work, projects, publications } from "collections/server";
import { loader } from "fumadocs-core/source";

export const source = loader({
  baseUrl: "/blog",
  source: docs.toFumadocsSource(),
});

export const workSource = loader({
  baseUrl: "/work",
  source: work.toFumadocsSource(),
});

export const projectsSource = loader({
  baseUrl: "/projects",
  source: projects.toFumadocsSource(),
});

export const publicationsSource = loader({
  baseUrl: "/publications",
  source: publications.toFumadocsSource(),
});

import { Hono } from "hono";
import { Env } from "../../types";

const RESUME_KEY = "resume.pdf";
const DEFAULT_CONTENT_TYPE = "application/octet-stream";

export const uploadRoutes = new Hono<{ Bindings: Env }>();

const fileHeaders = (object: R2Object) => {
  const headers = new Headers();
  headers.set(
    "Content-Type",
    object.httpMetadata?.contentType ?? DEFAULT_CONTENT_TYPE
  );
  headers.set(
    "Content-Disposition",
    object.httpMetadata?.contentDisposition ?? "inline"
  );
  headers.set("Cache-Control", "public, max-age=3600");

  if (object.etag) {
    headers.set("ETag", object.etag);
  }

  return headers;
};

const sanitizeKey = (rawKey: string) => {
  const decodedKey = decodeURIComponent(rawKey);
  return decodedKey.length > 0 &&
    !decodedKey.includes("/") &&
    !decodedKey.includes("..") &&
    /\.[a-z0-9]+$/i.test(decodedKey)
    ? decodedKey
    : null;
};

const getFileKey = (path: string) =>
  sanitizeKey(path.replace(/^\/files\//, ""));

const getFileUrl = (origin: string, key: string) =>
  `${origin}/files/${encodeURIComponent(key)}`;

const getAdminToken = (env: Env) =>
  `${env.ADMIN_USERNAME}:${env.ADMIN_PASSWORD}`;

const isAuthorized = (env: Env, authorization?: string) =>
  authorization === `Bearer ${getAdminToken(env)}`;

uploadRoutes.get("/files/*", async (c) => {
  const key = getFileKey(new URL(c.req.url).pathname);
  if (!key) {
    return c.json({ error: "File not found" }, 404);
  }

  const object = await c.env.STORAGE_BUCKET.get(key);
  if (!object) {
    return c.json({ error: "File not found" }, 404);
  }

  return new Response(object.body, {
    headers: fileHeaders(object),
  });
});

uploadRoutes.post("/admin/login", async (c) => {
  const body = await c.req.json<{ id?: string; password?: string }>().catch(
    () => null
  );

  if (
    body?.id !== c.env.ADMIN_USERNAME ||
    body.password !== c.env.ADMIN_PASSWORD
  ) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  return c.json({
    token: getAdminToken(c.env),
    resumeKey: RESUME_KEY,
    publicUrl: getFileUrl(new URL(c.req.url).origin, RESUME_KEY),
  });
});

uploadRoutes.get("/admin/files", async (c) => {
  if (!isAuthorized(c.env, c.req.header("Authorization"))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const list = await c.env.STORAGE_BUCKET.list();
  return c.json({
    files: list.objects.map((object) => ({
      key: object.key,
      size: object.size,
      uploaded: object.uploaded.toISOString(),
      publicUrl: getFileUrl(new URL(c.req.url).origin, object.key),
    })),
    resumeKey: RESUME_KEY,
  });
});

uploadRoutes.put("/admin/files/:key", async (c) => {
  if (!isAuthorized(c.env, c.req.header("Authorization"))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const key = sanitizeKey(c.req.param("key"));
  if (!key) {
    return c.json(
      { error: "Key must be a single filename with an extension" },
      400
    );
  }

  const body = await c.req.arrayBuffer();
  if (body.byteLength === 0) {
    return c.json({ error: "Upload is empty" }, 400);
  }

  const contentType =
    c.req.header("Content-Type")?.split(";")[0]?.trim() || DEFAULT_CONTENT_TYPE;

  await c.env.STORAGE_BUCKET.put(key, body, {
    httpMetadata: {
      contentType,
      contentDisposition: "inline",
    },
    customMetadata: {
      updatedAt: new Date().toISOString(),
    },
  });

  return c.json({
    key,
    size: body.byteLength,
    publicUrl: getFileUrl(new URL(c.req.url).origin, key),
  });
});

uploadRoutes.patch("/admin/files/:key", async (c) => {
  if (!isAuthorized(c.env, c.req.header("Authorization"))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const currentKey = sanitizeKey(c.req.param("key"));
  if (!currentKey) {
    return c.json(
      { error: "Key must be a single filename with an extension" },
      400
    );
  }

  const body = await c.req.json<{ key?: string }>().catch(() => null);
  const nextKey = body?.key ? sanitizeKey(body.key) : null;
  if (!nextKey) {
    return c.json(
      { error: "New key must be a single filename with an extension" },
      400
    );
  }

  if (currentKey === nextKey) {
    return c.json({
      key: nextKey,
      renamed: false,
      publicUrl: getFileUrl(new URL(c.req.url).origin, nextKey),
    });
  }

  const existingObject = await c.env.STORAGE_BUCKET.get(currentKey);
  if (!existingObject) {
    return c.json({ error: "File not found" }, 404);
  }

  const targetObject = await c.env.STORAGE_BUCKET.head(nextKey);
  if (targetObject) {
    return c.json({ error: "A file with that key already exists" }, 409);
  }

  await c.env.STORAGE_BUCKET.put(nextKey, existingObject.body, {
    httpMetadata: {
      contentType:
        existingObject.httpMetadata?.contentType ?? DEFAULT_CONTENT_TYPE,
      contentDisposition:
        existingObject.httpMetadata?.contentDisposition ?? "inline",
    },
    customMetadata: {
      ...existingObject.customMetadata,
      renamedFrom: currentKey,
      updatedAt: new Date().toISOString(),
    },
  });
  await c.env.STORAGE_BUCKET.delete(currentKey);

  return c.json({
    key: nextKey,
    previousKey: currentKey,
    renamed: true,
    publicUrl: getFileUrl(new URL(c.req.url).origin, nextKey),
  });
});

uploadRoutes.delete("/admin/files/:key", async (c) => {
  if (!isAuthorized(c.env, c.req.header("Authorization"))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const key = sanitizeKey(c.req.param("key"));
  if (!key) {
    return c.json(
      { error: "Key must be a single filename with an extension" },
      400
    );
  }

  await c.env.STORAGE_BUCKET.delete(key);
  return c.json({ key, deleted: true });
});

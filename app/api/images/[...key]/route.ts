import { env } from "cloudflare:workers";

type Context = { params: Promise<{ key: string[] }> };

export async function GET(_request: Request, context: Context) {
  if (!env.BUCKET) return new Response("Imagem indisponível", { status: 503 });
  const key = (await context.params).key.join("/");
  const object = await env.BUCKET.get(key);
  if (!object) return new Response("Imagem não encontrada", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=86400");
  return new Response(object.body, { headers });
}

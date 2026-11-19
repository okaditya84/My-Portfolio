// Vercel Routing Middleware: serve markdown to agents that ask for it
// (Accept: text/markdown); browsers keep getting HTML.
export const config = { matcher: ["/", "/projects"] };

export default async function middleware(request) {
  const accept = request.headers.get("accept") || "";
  if (!accept.includes("text/markdown")) return;

  const url = new URL(request.url);
  const target = url.pathname === "/projects" ? "/projects.md" : "/index.md";
  const res = await fetch(new URL(target, url));
  if (!res.ok) return;

  return new Response(await res.text(), {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Vary": "Accept",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

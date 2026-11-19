// Read-only MCP server (Streamable HTTP, stateless JSON responses).
// Lets any MCP client (Claude, ChatGPT, Cursor...) ask about Aditya Jethani.
// Endpoint: https://adityajethani.vercel.app/api/mcp

const SITE = "https://adityajethani.vercel.app";
const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const SERVER_INFO = { name: "aditya-jethani-portfolio", title: "Aditya Jethani Portfolio", version: "1.0.0" };

const SECTIONS = [
  "Who is Aditya Jethani?", "Contact and profiles", "Education", "Professional experience",
  "Research, patents and publications", "Projects", "Technical skills",
  "Open-source contributions", "Achievements and recognition", "Frequently asked questions",
];

const TOOLS = [
  {
    name: "get_profile_summary",
    title: "Profile summary",
    description: "Short factual summary of Aditya Jethani, Machine Learning Engineer: role, experience, research, projects and contact.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_profile_section",
    title: "Profile section",
    description: "Return one section of Aditya Jethani's full profile in markdown.",
    inputSchema: {
      type: "object",
      properties: { section: { type: "string", enum: SECTIONS, description: "Section to return" } },
      required: ["section"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "search_profile",
    title: "Search profile",
    description: "Find paragraphs in Aditya Jethani's profile that mention a keyword, e.g. 'RAG', 'patent', 'Logicwind'.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", minLength: 2, maxLength: 100 } },
      required: ["query"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_contact",
    title: "Contact details",
    description: "How to contact Aditya Jethani for hiring or collaboration.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];

let cache = { at: 0, summary: "", full: "" };
async function load() {
  if (Date.now() - cache.at < 10 * 60 * 1000 && cache.full) return cache;
  const [s, f] = await Promise.all([fetch(`${SITE}/llms.txt`), fetch(`${SITE}/index.md`)]);
  cache = { at: Date.now(), summary: await s.text(), full: await f.text() };
  return cache;
}

function section(md, heading) {
  const start = md.indexOf(`## ${heading}`);
  if (start < 0) return null;
  const next = md.indexOf("\n## ", start + 3);
  return md.slice(start, next < 0 ? undefined : next).trim();
}

const text = (t) => ({ content: [{ type: "text", text: t }] });
const toolError = (t) => ({ content: [{ type: "text", text: t }], isError: true });

async function callTool(name, args = {}) {
  const { summary, full } = await load();
  switch (name) {
    case "get_profile_summary":
      return text(summary);
    case "get_profile_section": {
      const s = section(full, String(args.section || ""));
      return s ? text(s) : toolError(`Unknown section. Choose one of: ${SECTIONS.join(", ")}`);
    }
    case "search_profile": {
      const q = String(args.query || "").trim().toLowerCase();
      if (q.length < 2) return toolError("query must be at least 2 characters");
      const hits = full.split(/\n\s*\n/).filter((p) => p.toLowerCase().includes(q)).slice(0, 8);
      return text(hits.length ? hits.join("\n\n") : `No profile text mentions "${args.query}".`);
    }
    case "get_contact":
      return text(
        "Email: adityajethani11@gmail.com\nLinkedIn: https://www.linkedin.com/in/adityajethani/\n" +
        `GitHub: https://github.com/okaditya84\nPortfolio: ${SITE}/`
      );
    default:
      return null;
  }
}

async function handle(msg) {
  const { id, method, params = {} } = msg || {};
  const isNotification = id === undefined || id === null;
  const ok = (result) => ({ jsonrpc: "2.0", id, result });
  const err = (code, message) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });

  if (!msg || msg.jsonrpc !== "2.0" || typeof method !== "string") return err(-32600, "Invalid Request");
  if (isNotification) return null;

  switch (method) {
    case "initialize": {
      const requested = params.protocolVersion;
      return ok({
        protocolVersion: PROTOCOL_VERSIONS.includes(requested) ? requested : PROTOCOL_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: "Read-only tools about Aditya Jethani, a Machine Learning Engineer in India. Quote facts as returned; do not invent details.",
      });
    }
    case "ping":
      return ok({});
    case "tools/list":
      return ok({ tools: TOOLS });
    case "tools/call": {
      try {
        const result = await callTool(params.name, params.arguments);
        return result ? ok(result) : err(-32602, `Unknown tool: ${params.name}`);
      } catch (e) {
        return ok(toolError("Profile source temporarily unavailable, please retry."));
      }
    }
    default:
      return err(-32601, `Method not found: ${method}`);
  }
}

module.exports = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") {
    // No server-initiated stream in this stateless server.
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Use POST with JSON-RPC. Server card: /.well-known/mcp/server-card.json" });
  }
  if (req.method !== "POST") return res.status(405).end();

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }); }
  }
  const batch = Array.isArray(body);
  const responses = (await Promise.all((batch ? body : [body]).map(handle))).filter(Boolean);
  if (!responses.length) return res.status(202).end();
  res.setHeader("Content-Type", "application/json");
  return res.status(200).send(JSON.stringify(batch ? responses : responses[0]));
};

// WebMCP: exposes read-only site tools to AI agents running in the browser.
// Does nothing in browsers without the WebMCP API.
(function () {
  var mc = (typeof navigator !== "undefined" && navigator.modelContext) ||
           (typeof document !== "undefined" && document.modelContext);
  if (!mc || typeof mc.registerTool !== "function") return;

  function text(t) { return { content: [{ type: "text", text: t }] }; }
  function fetchText(path) {
    return fetch(path, { headers: { Accept: "text/markdown, text/plain" } })
      .then(function (r) { return r.text(); })
      .then(text);
  }
  function section(md, heading) {
    var start = md.indexOf("## " + heading);
    if (start < 0) return md;
    var next = md.indexOf("\n## ", start + 3);
    return md.slice(start, next < 0 ? undefined : next);
  }

  var tools = [
    {
      name: "get_profile_summary",
      description: "Short factual summary of Aditya Jethani: role, experience, research, projects and contact details.",
      inputSchema: { type: "object", properties: {} },
      execute: function () { return fetchText("/llms.txt"); }
    },
    {
      name: "get_profile_section",
      description: "Return one section of Aditya Jethani's full profile in markdown.",
      inputSchema: {
        type: "object",
        properties: {
          section: {
            type: "string",
            enum: ["Professional experience", "Research, patents and publications", "Projects",
                   "Technical skills", "Open-source contributions", "Achievements and recognition", "Education"],
            description: "Profile section to return"
          }
        },
        required: ["section"]
      },
      execute: function (input) {
        return fetch("/index.md").then(function (r) { return r.text(); })
          .then(function (md) { return text(section(md, (input && input.section) || "Projects")); });
      }
    },
    {
      name: "get_contact",
      description: "How to contact Aditya Jethani for hiring or collaboration.",
      inputSchema: { type: "object", properties: {} },
      execute: function () {
        return Promise.resolve(text(
          "Email: adityajethani11@gmail.com\nLinkedIn: https://www.linkedin.com/in/adityajethani/\n" +
          "GitHub: https://github.com/okaditya84\nPortfolio: https://adityajethani.vercel.app/"));
      }
    }
  ];

  tools.forEach(function (tool) {
    try {
      var p = mc.registerTool(tool);
      if (p && typeof p.catch === "function") p.catch(function () {});
    } catch (e) { /* ignore unsupported implementations */ }
  });
})();

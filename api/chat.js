// Velox AI proxy — runs on Vercel as a serverless function.
// Keeps your API keys hidden on the server.
// Setup: Vercel project -> Settings -> Environment Variables -> add:
//   OPENROUTER_API_KEY = sk-or-v1-xxxxxxxx        (free-tier fallback chain)
//   ANTHROPIC_API_KEY  = sk-ant-api03-xxxxxxxx     (optional — real Claude, paid, tried FIRST if set)
// Then redeploy.

// Cheapest current Claude model — used only if ANTHROPIC_API_KEY is set.
const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

async function askClaude(trimmed, maxTokens) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null; // not configured — caller falls back to free chain
  const system = trimmed.filter(m => m.role === "system").map(m => m.content).join("\n") || undefined;
  const convo = trimmed.filter(m => m.role !== "system").map(m => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content
  }));
  if (!convo.length) return null;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      system,
      messages: convo,
      max_tokens: Math.min(maxTokens, 4096)
    })
  });
  const data = await r.json().catch(() => null);
  if (!data || data.error) throw new Error((data && data.error && data.error.message) || ("HTTP " + r.status));
  const block = data.content && data.content.find(c => c.type === "text");
  const content = block && block.text ? String(block.text).trim() : "";
  if (!content) throw new Error("Empty response");
  return { content, model: CLAUDE_MODEL };
}

const MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "openai/gpt-oss-120b:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "meta-llama/llama-3.3-70b-instruct:free"
];

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const messages = body && body.messages;
  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: "messages array required" });
  }
  // basic safety limits
  const trimmed = messages.slice(-24).map(m => ({
    role: m.role === "assistant" ? "assistant" : (m.role === "system" ? "system" : "user"),
    content: String(m.content || "").slice(0, 8000)
  }));
  const maxTokens = Math.min(Number(body.max_tokens) || 1200, 8000);

  // 1) Try real Claude first, if ANTHROPIC_API_KEY is configured on Vercel.
  try {
    const claudeResult = await askClaude(trimmed, maxTokens);
    if (claudeResult) return res.status(200).json(claudeResult);
  } catch (e) {
    // Claude failed (bad key, rate limit, etc.) — fall through to the free chain below.
  }

  // 2) Free OpenRouter model chain (used when ANTHROPIC_API_KEY isn't set, or Claude failed).
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return res.status(500).json({
      error: "No AI provider available. Add ANTHROPIC_API_KEY and/or OPENROUTER_API_KEY in Vercel: Project -> Settings -> Environment Variables, then redeploy."
    });
  }

  const chain = body.model ? [String(body.model), ...MODELS] : MODELS;
  let lastErr = "unknown";
  for (const model of chain) {
    try {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
        body: JSON.stringify({ model, messages: trimmed, max_tokens: Math.min(Number(body.max_tokens) || 1200, 8000) })
      });
      const data = await r.json().catch(() => null);
      if (!data) throw new Error("HTTP " + r.status);
      if (data.error) throw new Error(data.error.message || ("HTTP " + r.status));
      const msg = data.choices && data.choices[0] && data.choices[0].message;
      const content = msg && msg.content ? String(msg.content).trim() : "";
      if (content) return res.status(200).json({ content, model });
      throw new Error("Empty response");
    } catch (e) {
      lastErr = e.message || String(e);
    }
  }
  return res.status(502).json({ error: "All models failed: " + lastErr });
};

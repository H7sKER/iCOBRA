import { Router } from "express";
import * as fs from "fs";
import * as path from "path";

const router = Router();

const GEMINI_API_KEY = process.env["GEMINI_API_KEY"] ?? "";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to your .env file or environment."
    );
  }
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${body}`);
  }
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(no response)";
}

const SKIP_DIRS = new Set([
  ".git", "node_modules", ".gradle", "build", ".expo",
  "__pycache__", ".dart_tool", ".idea", "dist", ".cache",
]);

function collectStructure(root: string, maxDepth = 3): string {
  const lines: string[] = [path.basename(root) + "/"];
  function walk(dir: string, depth: number, prefix: string) {
    if (depth > maxDepth) return;
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    entries = entries.filter((e) => !SKIP_DIRS.has(e.name));
    entries.sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    entries.forEach((e, i) => {
      const last = i === entries.length - 1;
      lines.push(`${prefix}${last ? "└── " : "├── "}${e.name}${e.isDirectory() ? "/" : ""}`);
      if (e.isDirectory())
        walk(path.join(dir, e.name), depth + 1, prefix + (last ? "    " : "│   "));
    });
  }
  walk(root, 1, "");
  return lines.join("\n");
}

function readKeyFiles(root: string): string {
  const KEY = [
    "package.json", "README.md", "app.json", "app.config.ts",
    "requirements.txt", "Cargo.toml", "go.mod", "index.ts",
    "index.js", "main.py", "App.tsx", "App.js",
  ];
  const parts: string[] = [];
  for (const f of KEY) {
    const fp = path.join(root, f);
    if (!fs.existsSync(fp)) continue;
    try {
      let c = fs.readFileSync(fp, "utf8");
      if (c.length > 6000) c = c.slice(0, 6000) + "\n...(truncated)";
      parts.push(`### ${f}\n\`\`\`\n${c}\n\`\`\``);
    } catch {}
  }
  return parts.join("\n\n") || "(no key files found)";
}

/** POST /api/ai/analyze — Full project analysis via Gemini */
router.post("/ai/analyze", async (req, res) => {
  const { projectPath, question } = req.body as {
    projectPath?: string; question?: string;
  };
  if (!projectPath) { res.status(400).json({ error: "projectPath is required" }); return; }
  if (!fs.existsSync(projectPath)) { res.status(404).json({ error: "Path not found" }); return; }

  try {
    const structure = collectStructure(projectPath, 3);
    const keyFiles = readKeyFiles(projectPath);
    const q = question ?? "Analyze this project: give an overview, tech stack, code quality issues, and improvement suggestions.";

    const prompt = [
      "You are an expert code assistant in HackerStudio — a mobile code IDE for Android.",
      "", "Project: " + projectPath,
      "", "Directory structure:", "```", structure, "```",
      "", "Key files:", keyFiles,
      "", "Task: " + q,
      "", "Format your response with these headings:",
      "**Project Overview** | **Tech Stack** | **Code Quality** | **Suggestions** | **Summary**",
    ].join("\n");

    const analysis = await callGemini(prompt);
    res.json({ success: true, analysis, projectPath });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
});

/** POST /api/ai/chat — Conversational AI with project context */
router.post("/ai/chat", async (req, res) => {
  const { projectPath, message, history } = req.body as {
    projectPath?: string; message?: string;
    history?: Array<{ role: string; content: string }>;
  };
  if (!message) { res.status(400).json({ error: "message is required" }); return; }
  try {
    const parts = [
      "You are an expert coding assistant in HackerStudio — a mobile IDE for Android.",
    ];
    if (projectPath && fs.existsSync(projectPath)) {
      parts.push("", "Open project: " + path.basename(projectPath),
        "```", collectStructure(projectPath, 2), "```");
    }
    if (history?.length) {
      parts.push("");
      for (const h of history) {
        parts.push((h.role === "user" ? "User" : "Assistant") + ": " + h.content);
      }
    }
    parts.push("", "User: " + message, "", "Assistant:");
    const response = await callGemini(parts.join("\n"));
    res.json({ success: true, response });
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

/** POST /api/ai/explain — Explain code */
router.post("/ai/explain", async (req, res) => {
  const { code, language, filePath } = req.body as {
    code?: string; language?: string; filePath?: string;
  };
  if (!code) { res.status(400).json({ error: "code is required" }); return; }
  try {
    const lang = language ?? "code";
    const fname = filePath ? path.basename(filePath) : "";
    const prompt = [
      `Explain this ${lang} code${fname ? " (" + fname + ")" : ""} clearly and concisely.`,
      "Cover: what it does, how it works, and any potential issues.",
      "", "```" + lang, code, "```",
    ].join("\n");
    const explanation = await callGemini(prompt);
    res.json({ success: true, explanation });
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

/** POST /api/ai/fix — Fix code bugs */
router.post("/ai/fix", async (req, res) => {
  const { code, error: errorMsg, language, filePath } = req.body as {
    code?: string; error?: string; language?: string; filePath?: string;
  };
  if (!code) { res.status(400).json({ error: "code is required" }); return; }
  try {
    const lang = language ?? "code";
    const prompt = [
      `Fix the following ${lang} code${filePath ? " (" + path.basename(filePath) + ")" : ""}.`,
      errorMsg ? "Error message: " + errorMsg : "",
      "Return ONLY the corrected code without any markdown fences.",
      "", code,
    ].filter(Boolean).join("\n");
    const fixedCode = await callGemini(prompt);
    res.json({ success: true, fixedCode });
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

export default router;

import { Router } from "express";
import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";

const router = Router();

const PROJECTS_ROOT =
  process.env["PROJECTS_ROOT"] ?? "/sdcard/HackerStudioProjects";

function runCmd(
  cmd: string,
  args: string[],
  cwd: string,
  timeoutMs = 120000
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    let out = "";
    let err = "";
    const proc = spawn(cmd, args, {
      cwd,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    });
    proc.stdout.on("data", (d: Buffer) => { out += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { err += d.toString(); });
    const t = setTimeout(() => {
      proc.kill();
      resolve({ stdout: out, stderr: err + "\nProcess timed out", exitCode: 124 });
    }, timeoutMs);
    proc.on("close", (code) => { clearTimeout(t); resolve({ stdout: out, stderr: err, exitCode: code ?? 0 }); });
    proc.on("error", (e) => { clearTimeout(t); resolve({ stdout: out, stderr: e.message, exitCode: 1 }); });
  });
}

function detectProjectType(dir: string): string {
  const checks: Array<[string, string]> = [
    ["package.json", "node"], ["requirements.txt", "python"],
    ["Cargo.toml", "rust"], ["go.mod", "go"], ["pom.xml", "java"],
    ["build.gradle", "android"], ["pubspec.yaml", "flutter"],
    ["CMakeLists.txt", "cpp"], ["Gemfile", "ruby"],
  ];
  for (const [file, type] of checks) {
    if (fs.existsSync(path.join(dir, file))) return type;
  }
  return "unknown";
}

/** POST /api/git/clone */
router.post("/git/clone", async (req, res) => {
  const { repoUrl, projectName, targetDir, branch } = req.body as {
    repoUrl?: string; projectName?: string; targetDir?: string; branch?: string;
  };
  if (!repoUrl) { res.status(400).json({ error: "repoUrl is required" }); return; }

  const name =
    projectName ??
    path.basename(repoUrl.replace(/\.git$/, "")).replace(/[^a-zA-Z0-9_\-.]/g, "_") ||
    "cloned_project";

  const cloneRoot = targetDir ?? PROJECTS_ROOT;
  try { fs.mkdirSync(cloneRoot, { recursive: true }); } catch {}

  const destPath = path.join(cloneRoot, name);
  if (fs.existsSync(destPath)) {
    res.status(409).json({ error: `"${name}" already exists at ${destPath}`, path: destPath });
    return;
  }

  const args = ["clone", "--depth=1"];
  if (branch) args.push("--branch", branch);
  args.push(repoUrl, destPath);

  const result = await runCmd("git", args, cloneRoot, 120000);

  if (result.exitCode !== 0) {
    res.status(500).json({ error: "Git clone failed", details: result.stderr || result.stdout });
    return;
  }

  res.json({
    success: true,
    path: destPath,
    name,
    projectType: detectProjectType(destPath),
    message: `Cloned to ${destPath}`,
  });
});

/** POST /api/git/pull */
router.post("/git/pull", async (req, res) => {
  const { projectPath } = req.body as { projectPath?: string };
  if (!projectPath) { res.status(400).json({ error: "projectPath is required" }); return; }
  if (!fs.existsSync(projectPath)) { res.status(404).json({ error: "Path not found" }); return; }
  const result = await runCmd("git", ["pull", "--ff-only"], projectPath, 60000);
  res.json({ success: result.exitCode === 0, ...result });
});

/** GET /api/git/status */
router.get("/git/status", async (req, res) => {
  const { projectPath } = req.query as { projectPath?: string };
  if (!projectPath) { res.status(400).json({ error: "projectPath is required" }); return; }
  const [status, branch, log] = await Promise.all([
    runCmd("git", ["status", "--short"], projectPath, 10000),
    runCmd("git", ["rev-parse", "--abbrev-ref", "HEAD"], projectPath, 10000),
    runCmd("git", ["log", "--oneline", "-5"], projectPath, 10000),
  ]);
  res.json({
    status: status.stdout,
    branch: branch.stdout.trim(),
    recentCommits: log.stdout.trim().split("\n").filter(Boolean),
    hasChanges: status.stdout.trim().length > 0,
  });
});

export default router;

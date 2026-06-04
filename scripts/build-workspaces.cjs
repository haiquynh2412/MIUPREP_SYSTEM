const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";

const preferredOrder = [
  "@miuprep/knowledge",
  "@miuprep/learning",
  "@miuprep/content",
  "@miuprep/core",
  "@miuprep/db",
  "@miuprep/ai",
  "@miuprep/beta",
  "@miuprep/ui",
  "@miuprep/cpe-desktop",
  "@miuprep/desktop",
  "miumath-app",
  "miuprep-portal",
  "sat-studio",
];

function workspaceDirs() {
  return ["packages", "apps"]
    .flatMap((folder) => {
      const root = path.join(repoRoot, folder);
      if (!fs.existsSync(root)) return [];
      return fs.readdirSync(root).map((entry) => path.join(root, entry));
    })
    .filter((entryPath) => fs.existsSync(path.join(entryPath, "package.json")));
}

const workspaces = workspaceDirs()
  .map((entryPath) => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(entryPath, "package.json"), "utf8"));
    return {
      name: packageJson.name,
      hasBuild: Boolean(packageJson.scripts && packageJson.scripts.build),
    };
  })
  .filter((workspace) => workspace.name && workspace.hasBuild);

const workspaceByName = new Map(workspaces.map((workspace) => [workspace.name, workspace]));
const orderedNames = [
  ...preferredOrder.filter((name) => workspaceByName.has(name)),
  ...workspaces.map((workspace) => workspace.name).filter((name) => !preferredOrder.includes(name)).sort(),
];

for (const name of orderedNames) {
  console.log(`\n> Building ${name}`);
  const result = runNpm(["run", "build", "-w", name]);
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function runNpm(args) {
  if (!isWindows) {
    return spawnSync(npmCommand, args, {
      cwd: repoRoot,
      stdio: "inherit",
      shell: false,
    });
  }

  return spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", [npmCommand, ...args.map(quoteCmdArg)].join(" ")], {
    cwd: repoRoot,
    stdio: "inherit",
    shell: false,
  });
}

function quoteCmdArg(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_@./:-]+$/.test(text)) return text;
  return `"${text.replace(/"/g, '\\"')}"`;
}

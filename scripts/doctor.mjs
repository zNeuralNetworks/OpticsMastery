import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const cwd = process.cwd();
const packageJsonPath = path.join(cwd, "package.json");
const lockfilePath = path.join(cwd, "package-lock.json");
const nvmrcPath = path.join(cwd, ".nvmrc");

const results = [];

function addCheck(status, label, detail) {
  results.push({ status, label, detail });
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function readTrimmed(filePath) {
  return fs.readFileSync(filePath, "utf8").trim();
}

function normalizeVersion(raw) {
  return raw.replace(/^v/, "").trim();
}

if (!fileExists(packageJsonPath)) {
  console.error("package.json not found");
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const currentNode = normalizeVersion(process.version);
const currentNpm = normalizeVersion(process.env.npm_config_user_agent?.match(/npm\/([^\s]+)/)?.[1] ?? "unknown");

if (fileExists(nvmrcPath)) {
  const pinnedNode = normalizeVersion(readTrimmed(nvmrcPath));
  addCheck(
    pinnedNode === currentNode ? "PASS" : "WARN",
    "Node runtime",
    pinnedNode === currentNode
      ? `Current Node ${currentNode} matches .nvmrc`
      : `Current Node ${currentNode} differs from .nvmrc ${pinnedNode}`,
  );
} else {
  addCheck("WARN", "Node runtime", "No .nvmrc file present");
}

if (packageJson.engines?.node) {
  addCheck("PASS", "Package engines", `package.json declares node ${packageJson.engines.node}`);
} else {
  addCheck("WARN", "Package engines", "package.json is missing an engines.node declaration");
}

if (packageJson.packageManager) {
  addCheck("PASS", "Package manager", `package.json pins ${packageJson.packageManager}`);
} else {
  addCheck("WARN", "Package manager", "package.json is missing packageManager");
}

addCheck(fileExists(lockfilePath) ? "PASS" : "FAIL", "Lockfile", fileExists(lockfilePath) ? "package-lock.json present" : "package-lock.json missing");

const proxyVariables = [
  "http_proxy",
  "https_proxy",
  "npm_config_http_proxy",
  "npm_config_https_proxy",
].filter((name) => process.env[name]);

if (proxyVariables.length > 0) {
  addCheck(
    "WARN",
    "Proxy environment",
    `Deprecated lowercase proxy env detected: ${proxyVariables.join(", ")}. Prefer uppercase proxy vars or .npmrc-scoped config.`,
  );
} else {
  addCheck("PASS", "Proxy environment", "No deprecated lowercase proxy env vars detected");
}

if (currentNpm === "unknown") {
  addCheck("WARN", "npm runtime", "npm version unavailable outside npm-launched process");
} else {
  addCheck("PASS", "npm runtime", `Current npm ${currentNpm}`);
}

const hasFailure = results.some((result) => result.status === "FAIL");

for (const result of results) {
  console.log(`${result.status.padEnd(4)} ${result.label}: ${result.detail}`);
}

if (hasFailure) {
  process.exit(1);
}

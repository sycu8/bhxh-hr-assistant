import { spawn, execSync } from "node:child_process";

const port = Number(process.env.PLAYWRIGHT_PORT ?? "3199");
const host = "127.0.0.1";

function freePort() {
  if (process.platform === "win32") {
    try {
      execSync(
        `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`,
        { stdio: "ignore" },
      );
    } catch {
      // Port already free or no permission to kill — next start will surface EADDRINUSE.
    }
    return;
  }

  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, {
      stdio: "ignore",
      shell: true,
    });
  } catch {
    // ignore
  }
}

freePort();

const child = spawn(
  process.platform === "win32" ? "pnpm.cmd" : "pnpm",
  ["exec", "next", "start", "-H", host, "-p", String(port)],
  { stdio: "inherit", env: process.env, shell: process.platform === "win32" },
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));

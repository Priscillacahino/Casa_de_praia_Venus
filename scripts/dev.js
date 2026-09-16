import { spawn } from "node:child_process";
const children = [
  spawn(process.execPath, ["server/index.js"], { stdio: "inherit" }),
  spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "--port=3000", "--host=0.0.0.0"],
    { stdio: "inherit" },
  ),
];
let stopping = false;
const stop = () => {
  if (stopping) return;
  stopping = true;
  for (const p of children) p.kill();
};
for (const c of children) c.on("exit", () => stop());
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

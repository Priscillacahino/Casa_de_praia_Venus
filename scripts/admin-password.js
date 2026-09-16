import { randomBytes, scryptSync } from "node:crypto";
if (!process.stdin.isTTY) throw new Error("Execute em um terminal interativo.");
process.stdout.write("Nova senha administrativa (mínimo 12 caracteres): ");
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");
let password = "";
process.stdin.on("data", (chunk) => {
  for (const char of chunk) {
    if (char === "\u0003") process.exit(1);
    if (char === "\r" || char === "\n") {
      process.stdin.setRawMode(false);
      if (password.length < 12) {
        console.error("\nSenha muito curta.");
        process.exit(1);
      }
      const salt = randomBytes(16).toString("hex");
      console.log(
        "\nADMIN_PASSWORD_HASH=" +
          salt +
          ":" +
          scryptSync(password, salt, 64).toString("hex"),
      );
      process.exit(0);
    }
    if (char === "\u007f") password = password.slice(0, -1);
    else password += char;
  }
});

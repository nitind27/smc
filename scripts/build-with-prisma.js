/**
 * Ensures DATABASE_URL exists for prisma generate (required by Prisma schema).
 * Writes .env when missing so Prisma sees the variable on Vercel build.
 * Runtime still needs real DATABASE_URL in Vercel Environment Variables.
 */
const path = require("path");
const fs = require("fs");
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");

const dummyUrl = "mysql://build:build@localhost:3306/build";
const urlToUse = process.env.DATABASE_URL || dummyUrl;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, "DATABASE_URL=\"" + urlToUse.replace(/"/g, '\\"') + "\"\n", "utf8");
}
process.env.DATABASE_URL = urlToUse;

const { execSync } = require("child_process");
execSync("npx prisma generate", {
  stdio: "inherit",
  cwd: root,
  env: { ...process.env, DATABASE_URL: urlToUse },
});

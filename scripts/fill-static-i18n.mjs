import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dictDir = join(__dirname, "..", "dictionaries");

function deepFill(target, source) {
  for (const key of Object.keys(source)) {
    const val = source[key];
    if (Array.isArray(val)) {
      target[key] = val;
    } else if (val && typeof val === "object") {
      if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) {
        target[key] = {};
      }
      deepFill(target[key], val);
    } else {
      target[key] = val;
    }
  }
}

for (const locale of ["es", "ar"]) {
  const dictPath = join(dictDir, `${locale}.json`);
  const transPath = join(__dirname, `${locale}-static-pages.json`);
  const dict = JSON.parse(readFileSync(dictPath, "utf8"));
  const translations = JSON.parse(readFileSync(transPath, "utf8"));
  deepFill(dict, translations);
  writeFileSync(dictPath, JSON.stringify(dict, null, 2) + "\n", "utf8");
  console.log(`${locale}.json updated.`);
}

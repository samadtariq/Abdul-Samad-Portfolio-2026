import { readFileSync } from "node:fs";
export const { collections: definitions } = JSON.parse(
  readFileSync(
    new URL("../database/runtime.schema.json", import.meta.url),
    "utf8",
  ),
);

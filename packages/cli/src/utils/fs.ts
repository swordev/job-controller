import { readFile } from "fs/promises";
import { isAbsolute } from "path";
import { join } from "path";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseJsonFile<T = any>(path: string) {
  path = isAbsolute(path) ? path : join(process.cwd(), path);
  return JSON.parse((await readFile(path)).toString()) as T;
}

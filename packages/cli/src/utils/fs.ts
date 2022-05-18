import { readFile, stat } from "fs/promises";
import { isAbsolute } from "path";
import { join } from "path";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseJsonFile<T = any>(path: string): Promise<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseJsonFile<T = any>(
  path: string,
  strict: true
): Promise<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseJsonFile<T = any>(
  path: string,
  strict: false
): Promise<T | undefined>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseJsonFile<T = any>(path: string, strict = true) {
  path = isAbsolute(path) ? path : join(process.cwd(), path);
  let contents: Buffer;
  try {
    contents = await readFile(path);
  } catch (error) {
    if (!strict && (error as NodeJS.ErrnoException).code == "ENOENT") return;
    throw error;
  }
  return JSON.parse(contents.toString()) as T;
}

export async function safeStat(path: string) {
  try {
    return await stat(path);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code == "ENOENT") return false;
    throw e;
  }
}

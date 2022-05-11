import type api from "../../api";
import { Config, parseFile } from "./config";
import { Client } from "@smcp/core/Client";

export async function makeClient(input: string | Config) {
  const config = typeof input === "string" ? await parseFile(input) : input;
  return new Client<typeof api>({
    ...(config.client ?? {}),
  });
}

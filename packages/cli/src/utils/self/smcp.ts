import type api from "../../api";
import { Config } from "./config";
import { Client } from "@smcp/core/Client";

export async function makeClient(config: Config) {
  return new Client<typeof api>({
    ...(config.client ?? {}),
  });
}

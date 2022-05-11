import { Config } from "../utils/self/config";
import { makeClient } from "../utils/self/smcp";

export type CheckOptions = { config: string | Config };

export default async function check(options: CheckOptions) {
  const client = await makeClient(options.config);
  const result = await client.api.check();
  if (result !== true) throw new Error(`Invalid check result: ${result}`);
}

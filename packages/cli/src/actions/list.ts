import { Config } from "../utils/self/config";
import { makeClient } from "../utils/self/smcp";

export type ListOptions = { config: string | Config };

export default async function list(options: ListOptions) {
  const client = await makeClient(options.config);
  return await client.api.list();
}

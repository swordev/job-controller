import { Config } from "../utils/self/config";
import { makeClient } from "../utils/self/smcp";

export type StopOptions = {
  ids: number[];
  config: string | Config;
};

export async function stop(options: StopOptions) {
  const client = await makeClient(options.config);
  await client.api.stop(options.ids);
}

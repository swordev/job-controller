import { Config } from "../utils/self/config";
import { makeClient } from "../utils/self/smcp";

export type StartOptions = {
  config: Config;
  name: string;
  args?: string[];
  onStderr?: (data: string) => void;
  onStdout?: (data: string) => void;
};

export default async function start(options: StartOptions) {
  const client = await makeClient(options.config);
  const result = await client.api.start({
    name: options.name,
    args: options.args,
    onStderr: options.onStderr || ((data) => process.stderr.write(data)),
    onStdout: options.onStdout || ((data) => process.stdout.write(data)),
  });
  return { exitCode: result.exitCode };
}

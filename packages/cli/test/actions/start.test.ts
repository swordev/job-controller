/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import start from "../../src/actions/start";
import startServer from "../../src/actions/startServer";
import { parseConfigFile } from "../../src/utils/self/config";

const configPath = `${__dirname}/../job-controller.config.json`;

describe("start", () => {
  it("starts a new process", async () => {
    const server = await startServer({
      config: await parseConfigFile(configPath),
      optionalConnectionToken: true,
    });
    const config = {
      client: {
        url: `ws://127.0.0.1:${server.port}`,
      },
    };
    const onStdout = jest.fn((_data: string) => 1);
    const onStderr = jest.fn((_data: string) => 1);
    const { exitCode } = await start({
      config,
      name: "echo",
      args: ["world"],
      onStdout,
      onStderr,
    });
    expect(exitCode).toBe(0);
    expect(onStderr).toBeCalledTimes(0);
    expect(onStdout).toBeCalledTimes(1);
    expect(onStdout).toHaveBeenLastCalledWith(`hello world\n`);

    await server.stop();
  });
});

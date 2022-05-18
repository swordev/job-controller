/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import list from "../../src/actions/list";
import start from "../../src/actions/start";
import startServer from "../../src/actions/startServer";
import { parseConfigFile } from "../../src/utils/self/config";

const configPath = `${__dirname}/../job-controller.config.json`;

describe("list", () => {
  it("returns the current job", async () => {
    const server = await startServer({
      config: await parseConfigFile(configPath),
      optionalConnectionToken: true,
    });

    const config = {
      client: {
        url: `ws://127.0.0.1:${server.port}`,
      },
    };

    const startResult = start({
      config,
      name: "sleep",
      args: ["4"],
    });

    const listResult = new Promise<Awaited<ReturnType<typeof list>>>(
      (resolve) => {
        setTimeout(async () => {
          resolve(
            await list({
              config,
            })
          );
        }, 1000);
      }
    );

    const listResultData = await listResult;

    expect(listResultData.length).toBe(1);
    expect(listResultData[0].id).toBe(0);
    expect(listResultData[0].name).toBe("sleep");
    expect(listResultData[0].args).toMatchObject(["4"]);

    await startResult;

    const endResultData = await list({
      config,
    });

    expect(endResultData.length).toBe(0);

    await server.stop();
  }, 10_000);
});

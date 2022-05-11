import api from "../api";
import { Config, ConfigModel, parseFile } from "../utils/self/config";
import { Server } from "@smcp/core/Server";
import { unwatchFile, watchFile } from "fs";
import { container } from "tsyringe";

export type StartServerOptions = {
  verbose?: boolean;
  config: string | Config;
};

export default async function startServer(options: StartServerOptions) {
  const config = options.config;
  const configData =
    typeof config === "string" ? await parseFile(config) : config;
  let currentConfigData = configData;
  const server = new Server({
    logging: true,
    ...configData.server,
    api,
    container,
    async onJsonRequest({ container }) {
      container.register(ConfigModel, {
        useValue: ConfigModel.create(currentConfigData),
      });
    },
  });

  await server.start();

  if (typeof config === "string") {
    watchFile(config, async () => {
      try {
        currentConfigData = await parseFile(config);
      } catch (error) {
        console.error(error);
      }
      server.updateOptions({
        connectionTokens: currentConfigData.server?.connectionTokens ?? [],
      });
    });
    server.http.on("close", () => unwatchFile(config));
  }

  console.log(
    `Listening on ${server.options.address ?? "0.0.0.0"}:${server.port}`
  );
  return server;
}

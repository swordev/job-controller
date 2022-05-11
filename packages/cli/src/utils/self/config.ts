import { parseJsonFile } from "../fs";
import { rootPath } from "../path";
import { ClientOptionsType } from "@smcp/core/Client";
import { OptionsType as ServerOptionsType } from "@smcp/core/Server";
import Ajv from "ajv";
import { resolve } from "path";

const ajv = new Ajv();

export type ClientConfig = {
  url: string;
  connectionToken?: string;
};

export type Config = {
  server?: Pick<
    ServerOptionsType<unknown, unknown>,
    "connectionTokens" | "address" | "port" | "logging"
  >;
  client?: Pick<ClientOptionsType, "url" | "connectionToken">;
  jobs?: Record<
    string,
    {
      command: string;
      charset?: { decoding: string };
      args: string[];
      uid?: number;
      gid?: number;
    }
  >;
};

export class ConfigModel {
  data!: Config;
  static create(data: Config) {
    const config = new ConfigModel();
    config.data = data;
    return config;
  }
}

export async function parseFile(
  path: string,
  deleteCache = true
): Promise<Config> {
  let json: Config;
  path = resolve(path);
  if (deleteCache) delete require.cache[path];
  if (path.endsWith(".json")) {
    json = await parseJsonFile(path);
  } else {
    json = require(path);
  }
  const configSchemaPath = `${rootPath}/config.schema.json`;
  const configSchema = await parseJsonFile(configSchemaPath);
  const valid = ajv.validate(configSchema, json);
  if (!valid)
    throw new Error(`Invalid config: ${JSON.stringify(ajv.errors, null, 2)}`);
  return json;
}

export function checkDiff(config1: Config, config2: Config) {
  return JSON.stringify(config1) !== JSON.stringify(config2);
}

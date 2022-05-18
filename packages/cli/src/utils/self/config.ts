import { parseJsonFile, safeStat } from "../fs";
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

export function parseEnvConfig(prefix = "JOB_CONTROLLER_") {
  const env = (name: string) => process.env[`${prefix}${name}`];
  const serverConnectionToken = env("SERVER_CONNECTION_TOKEN");

  return {
    server: {
      address: env("SERVER_ADDRESS"),
      connectionTokens: serverConnectionToken
        ? [serverConnectionToken]
        : undefined,
    },
    client: {
      connectionToken: env("CLIENT_CONNECTION_TOKEN"),
      url: env("CLIENT_URL"),
    },
  } as Pick<Config, "server" | "client">;
}

export function mergeConfig(config1: Config, config2: Config): Config {
  return {
    server: {
      ...config1.server,
      ...config2.server,
      ...((config1.server?.connectionTokens ||
        config2.server?.connectionTokens) && {
        connectionTokens: [
          ...(config1.server?.connectionTokens || []),
          ...(config2.server?.connectionTokens || []),
        ],
      }),
    },
    client: {
      ...config1.client,
      ...config2.client,
    },
  };
}

export async function parseConfigFile(
  path: string,
  options: {
    /**
     * @default true
     */
    requireConfigFile?: boolean;
    /**
     * @default true
     */
    deleteCache?: boolean;
    loadEnvConfig?: boolean;
  } = {}
): Promise<Config> {
  const deleteCache = options.deleteCache ?? true;
  const requireConfigFile = options.requireConfigFile ?? true;
  let json: Config = {};
  path = resolve(path);
  if (deleteCache) delete require.cache[path];
  if (requireConfigFile || (await safeStat(path))) {
    if (path.endsWith(".json")) {
      json = await parseJsonFile(path);
    } else {
      json = require(path);
    }
  }
  if (options.loadEnvConfig) {
    json = mergeConfig(json, parseEnvConfig());
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

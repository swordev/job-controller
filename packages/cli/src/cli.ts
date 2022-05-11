import "reflect-metadata";
import check from "./actions/check";
import list from "./actions/list";
import start from "./actions/start";
import startServer from "./actions/startServer";
import { stop } from "./actions/stop";
import { rootPath } from "./utils/path";
import { parseNumberList } from "./utils/string";
import { red } from "chalk";
import { program } from "commander";

const pkg: {
  name: string;
  version: string;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require(`${rootPath}/package.json`);

export type GlobalOptions = {
  configPath: string;
  verbose?: boolean;
};

function getGlobalOptions(): GlobalOptions {
  const options = program.opts() as GlobalOptions;
  return options;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeAction(cb: (...args: any[]) => Promise<any>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (...args: any[]) => {
    try {
      const result: {
        exitCode?: number;
      } = (await cb(...args)) as never;
      process.exit(result?.exitCode ?? 0);
    } catch (error) {
      console.error(red((error as Error).stack));
      process.exit(1);
    }
  };
}

export default () => {
  program
    .name(pkg.name)
    .version(pkg.version)
    .option("-v,--verbose")
    .option(
      "-c,--config-path [path]",
      "Config path",
      process.env["JOB_CONTROLLER_CONFIG_PATH"] ?? "./job-controller.config.js"
    );
  program.command("check").action(
    makeAction(async () => {
      const globalOptions = getGlobalOptions();
      await check({ config: globalOptions.configPath });
    })
  );
  program.command("list").action(
    makeAction(async () => {
      const globalOptions = getGlobalOptions();
      const jobs = await list({ config: globalOptions.configPath });
      for (const job of jobs) {
        console.info({
          id: job.id,
          date: job.date,
          command: job.name,
          args: job.args,
        });
      }
    })
  );
  program.command("start [jobName] [args...]").action(
    makeAction(async (name, args) => {
      const globalOptions = getGlobalOptions();
      return await start({
        config: globalOptions.configPath,
        name,
        args,
      });
    })
  );
  program.command("start-server").action(
    makeAction(async () => {
      const globalOptions = getGlobalOptions();
      return await startServer({
        config: globalOptions.configPath,
        verbose: globalOptions.verbose,
      });
    })
  );
  program
    .command("stop")
    .option("-i,--id [values]", "Job ids.", parseNumberList, [])
    .action(
      makeAction(async (options: { id: number[] }) => {
        const globalOptions = getGlobalOptions();
        return await stop({
          config: globalOptions.configPath,
          ids: options.id,
        });
      })
    );
  return program;
};

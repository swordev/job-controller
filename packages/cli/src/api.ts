import { execChildProcess } from "./utils/cli";
import { ConfigModel } from "./utils/self/config";
import { ChildProcess, spawn } from "child_process";
import { injectable } from "tsyringe";

type StartData = {
  name: string;
  args?: string[];
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
};

type Job = {
  id: number;
  data: StartData;
  childProcess: ChildProcess;
  date: string;
};

let jobCounterId = 0;
let jobs: Job[] = [];

@injectable()
export class JobApi {
  constructor(readonly config: ConfigModel) {}

  async check() {
    return true;
  }

  async list() {
    return jobs.map((v) => ({
      id: v.id,
      name: v.data.name,
      args: v.data.args,
      date: v.date,
    }));
  }

  async stop(ids: number[]) {
    for (const item of jobs) {
      if (ids.includes(item.id)) item.childProcess.kill();
    }
  }

  async start(data: StartData) {
    const config = this.config.data;
    const jobConfig = config.jobs?.[data.name];
    if (!jobConfig) throw new Error(`Job not found: ${data.name}`);

    const args =
      jobConfig.args?.flatMap((v) => (v === "@" ? data.args ?? [] : v)) ?? [];

    const childProcess = spawn(jobConfig.command, args, {
      gid: jobConfig.gid,
      uid: jobConfig.uid,
      env: {
        ...process.env,
        ...jobConfig.env,
      },
    });

    const job: Job = {
      data,
      date: new Date().toISOString(),
      id: jobCounterId++,
      childProcess,
    };

    try {
      const { onStdout, onStderr } = data;
      jobs.push(job);
      return await execChildProcess(childProcess, {
        charsetDecoding: jobConfig.charset?.decoding,
        ...(onStdout && {
          onStdout: (chunk) => onStdout(chunk.toString()),
        }),
        ...(onStderr && {
          onStderr: (chunk) => onStderr(chunk.toString()),
        }),
      });
    } finally {
      jobs = jobs.filter((v) => v !== job);
    }
  }
}

export default JobApi;

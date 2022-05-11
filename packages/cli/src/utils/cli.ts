import { ChildProcess, spawn, SpawnOptions } from "child_process";
import { decodeStream } from "iconv-lite";

export type ExecExtraOptions = {
  onStdout?: (chunk: Buffer) => void;
  onStderr?: (chunk: Buffer) => void;
  charsetDecoding?: string;
};

export async function exec(
  command: string,
  args: string[],
  options?: SpawnOptions,
  data: ExecExtraOptions = {}
) {
  const childProcess = spawn(command, args, options ?? {});
  return await execChildProcess(childProcess, data);
}

export async function execChildProcess(
  childProcess: ChildProcess,
  data: ExecExtraOptions = {}
) {
  return await new Promise<{ exitCode: number }>((resolve, reject) => {
    let streams = 1;
    let exitCode: number | null = null;
    const onEnd = () => {
      if (!--streams) resolve({ exitCode: exitCode ?? 0 });
    };
    const onError = (error: Error, process?: boolean) => {
      try {
        if (!process) {
          childProcess.removeAllListeners();
          childProcess.kill();
        }
        decoder?.stdout.removeAllListeners();
        decoder?.stderr.removeAllListeners();
      } finally {
        reject(error);
      }
    };
    const decoder = data.charsetDecoding
      ? {
          stdout: decodeStream(data.charsetDecoding),
          stderr: decodeStream(data.charsetDecoding),
        }
      : null;
    if (decoder) {
      streams += 2;
      if (data.onStdout && childProcess.stdout) {
        decoder.stdout.on("error", onError);
        decoder.stdout.on("data", data.onStdout);
        decoder.stdout.on("end", onEnd);
        childProcess.stdout.pipe(decoder.stdout);
      }
      if (data.onStderr && childProcess.stderr) {
        decoder.stderr.on("error", onError);
        decoder.stderr.on("data", data.onStderr);
        decoder.stderr.on("end", onEnd);
        childProcess.stderr.pipe(decoder.stderr);
      }
    } else {
      if (data.onStdout && childProcess.stdout)
        childProcess.stdout.on("data", data.onStdout);
      if (data.onStderr && childProcess.stderr)
        childProcess.stderr.on("data", data.onStderr);
    }
    childProcess.on("error", (error) => onError(error, true));
    childProcess.on("close", (code) => {
      exitCode = code;
      onEnd();
    });
  });
}

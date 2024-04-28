import { exec } from "child_process";
import os from "os";
import path from "path";
import { Binary } from "./binary";

/**
 * Ffmpeg wrapper
 */
export class Ffmpeg {
  /**
   * We get the file from a custom site with static ffmpeg builds. Because it includes builds for Apple silicon.
   * The official ffmpeg.org site does not include builds for silicon chip.
   */
  private readonly ffmpegBinary: Binary;

  constructor(
    private readonly callbacks?: {
      onProgressChange?: (progress: number) => void;
      onStatusChange?: (status: string) => void;
    },
  ) {
    this.ffmpegBinary =
      os.arch() === "arm64"
        ? new Binary({
            name: "ffmpeg",
            sha256: "326895b16940f238d76e902fc71150f10c388c281985756f9850ff800a2f1499",
            url: "https://www.osxexperts.net/ffmpeg7arm.zip",
          })
        : new Binary({
            name: "ffmpeg",
            sha256: "6a658787de8de14741acaedd14d5b81f7b44aef60711cbf7784208a2751933ec",
            url: "https://www.osxexperts.net/ffmpeg7intel.zip",
          });
  }

  /**
   * @todo add validations for params?
   */
  exec: (payload: { input: string; output: string; params?: (string | undefined)[] }) => Promise<void> = async (
    payload,
  ) => {
    const { input, params, output } = payload;

    if (input === output) {
      throw new Error("Cannot override source");
    }

    const binary = await this.ffmpegBinary.path();

    if (input.includes("ffmpeg")) {
      throw new Error("Path to ffmpeg command included automatically. Start your command directly from arguments");
    }

    return new Promise<void>((resolve, reject) => {
      this.callbacks?.onStatusChange?.(`Encoding ${path.basename(input)}`);
      const command = [`"${binary}"`, "-y", `-i "${input}"`, ...(params ?? []), "-progress pipe:1", `"${output}"`]
        .filter((param) => param != null)
        .join(" ");
      const ffmpegProcess = exec(command);

      ffmpegProcess.stdout?.on("data", (data) => {
        console.log(`ffmpeg stdout: ${data}`);
      });

      /**
       * Logging lines of the format:
       * `ffmpeg stderr: frame=   68 fps=0.0 q=31.0 size=       0KiB time=00:00:01.10 bitrate=   0.3kbits/s speed=2.18x`
       */
      ffmpegProcess.stderr?.on("data", (data) => {
        console.log(`ffmpeg stderr: ${data}`);

        if (typeof data === "string") {
          if (data.includes("frame=") === false) {
            return;
          }

          const matcher = data.match(/frame=\s+(\d+)/);

          if (matcher == null) {
            return;
          }

          const currentFrame = matcher[1];
          const parsedFrame = parseInt(currentFrame, 10);

          if (Number.isNaN(parsedFrame)) {
            return;
          }

          this.callbacks?.onProgressChange?.(parsedFrame);
        }
      });

      ffmpegProcess.on("error", (error) => {
        console.error("ffmpeg process error:", error);
        reject(error);
      });

      ffmpegProcess.on("exit", (code, signal) => {
        if (code === 0) {
          console.log("Video creation completed successfully.");
          resolve();
        } else {
          console.error(`ffmpeg process exited with code ${code} and signal ${signal}`);
          reject(new Error(`ffmpeg process exited with code ${code} and signal ${signal}`));
        }
      });
    });
  };
}

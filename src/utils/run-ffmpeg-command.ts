import { exec } from "child_process";

export const runFffmpegCommand = async (command: string, onProgress?: (frame: number) => void): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
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

        onProgress?.(parsedFrame);
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

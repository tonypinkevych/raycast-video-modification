import { environment } from "@raycast/api";
import decompress from "decompress";
import fs from "fs";
import afs from "fs/promises";
import os from "os";
import path from "path/posix";
import { downloadFile } from "./download-file";
import { sha256 } from "./sha-256";

type FileInfo = {
  file: string;
  sha256: string;
  url: string;
};
const getFileInfo = async (): Promise<FileInfo> => {
  if (os.arch() === "arm64") {
    return {
      file: "ffmpeg.zip",
      sha256: "326895b16940f238d76e902fc71150f10c388c281985756f9850ff800a2f1499",
      url: "https://www.osxexperts.net/ffmpeg7arm.zip",
    };
  }

  return {
    file: "ffmpeg.zip",
    sha256: "ebdddc936f61e14049a2d4b549a412b8a40deeff6540e58a9f2a2da9e6b18894",
    url: `https://evermeet.cx/ffmpeg/ffmpeg-6.1.1.zip`,
  };
};

const getTempDir = (): string => path.join(environment.supportPath, "temp");
export const getCliDir = (): string => path.join(environment.supportPath, "cli");
export const getCliPath = (): string => path.join(getCliDir(), "ffmpeg");

/**
 * Download ffmpeg CLI.
 */
export const getCli = async (onStatusChange?: (status: string) => void): Promise<string> => {
  const cli = getCliPath();
  const fileInfo = await getFileInfo();

  if (fs.existsSync(cli)) {
    return cli;
  } else {
    try {
      onStatusChange?.("Downloading");
      await downloadFile(fileInfo.url, path.join(getTempDir(), fileInfo.file));
    } catch (error) {
      console.error("Downloading ffmpeg error", error);
      throw new Error("Could not installed ffmpeg cli");
    }

    try {
      onStatusChange?.("Unzipping");
      await afs.mkdir(getCliDir(), { recursive: true });
      await decompress(path.join(getTempDir(), fileInfo.file), getCliDir());
    } catch (error) {
      console.error("Extracting binary error", error);
      throw new Error("Could not extract zip content of ffmpeg cli");
    }

    try {
      onStatusChange?.("Verifying");
      const binaryHash = await sha256(getCliPath());
      console.log(">>> HASH", binaryHash);
      if (binaryHash !== fileInfo.sha256) {
        throw new Error("hash of archive is wrong");
      }
    } catch (error) {
      await afs.rm(getCliDir(), { recursive: true });
      console.error("Binary verification failed", error);
      throw new Error("Binary verification failed");
    } finally {
      await afs.rm(getTempDir(), { recursive: true });
    }

    try {
      onStatusChange?.("Updating binary");
      await afs.chmod(cli, "755");
    } catch (error) {
      await afs.rm(cli);
      throw new Error("Could not chmod speedtest cli");
    }

    return cli;
  }
};

import axios from "axios";
import fs from "fs";
import path from "path";

/**
 * The procedure downloads the file at the specified url and saves it at the specified path.
 * Throws if the download fails.
 */
export const downloadFile = async (fromUrl: string, toLocalFilePath: string): Promise<void> => {
  const dirName = path.dirname(toLocalFilePath);

  if (fs.existsSync(dirName) === false) {
    fs.mkdirSync(dirName, { recursive: true });
  }

  const response = await axios({
    method: "GET",
    url: fromUrl,
    responseType: "stream",
  });

  const writer = fs.createWriteStream(toLocalFilePath);

  response.data.pipe(writer);

  return new Promise<void>((resolve, reject) => {
    writer.on("finish", () => {
      resolve();
    });
    writer.on("error", (err) => {
      reject(err);
    });
  });
};

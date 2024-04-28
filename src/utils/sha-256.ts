import * as crypto from "crypto";
import * as fs from "fs";

/**
 * Generates sha256 checksum.
 */
export const sha256 = async (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const fileStream = fs.createReadStream(filePath);

    fileStream.on("error", (err) => {
      reject(err);
    });

    hash.once("readable", () => {
      const data = hash.digest("hex");
      resolve(data);
    });

    fileStream.pipe(hash);
  });
};

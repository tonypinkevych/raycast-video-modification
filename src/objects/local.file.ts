import fs from "fs";
import path from "path";
import { File } from "../abstractions";

export class LocalFile implements File {
  constructor(private readonly _path: string) {}

  path: File["path"] = () => this._path;

  content: File["content"] = async () => fs.createReadStream(this._path);

  write: File["write"] = (content) =>
    new Promise((resolve, reject) => {
      const dirName = path.dirname(this._path);

      if (fs.existsSync(dirName) === false) {
        fs.mkdirSync(dirName, { recursive: true });
      }

      const writer = fs.createWriteStream(this._path);
      content.pipe(writer);
      writer.on("finish", () => {
        resolve();
      });
      writer.on("error", (err) => {
        reject(err);
      });
    });
}

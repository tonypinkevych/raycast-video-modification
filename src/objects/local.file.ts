import fs from "fs";
import path from "path";
import { File } from "../abstractions";

export class LocalFile implements File {
  constructor(private readonly _path: string) {}

  path: File["path"] = () => this._path;

  stream: File["stream"] = async () => fs.createReadStream(this._path);

  nextName: File["nextName"] = (counter: number = 1) => {
    const dirPath = path.dirname(this._path);
    const extension = path.extname(this._path);
    const baseName = path.basename(this._path, extension);
    const splitted = baseName.split(" ");
    const lastPart = splitted[splitted.length - 1];
    const digitsInName = parseInt(lastPart, 10);
    const isLastPartDigits = digitsInName.toString() === lastPart && Number.isNaN(digitsInName) === false;
    const baseNameWithoutDigits = splitted.slice(0, -1).join(" ");
    const nextName = isLastPartDigits ? `${baseNameWithoutDigits} ${digitsInName + counter}` : `${baseName} ${counter}`;
    const nextPath = path.join(dirPath, `${nextName}${extension}`);

    if (fs.existsSync(nextPath)) {
      return this.nextName(counter + 1);
    }

    return `${nextName}${extension}`;
  };

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

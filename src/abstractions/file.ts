import { ReadStream } from "fs";

export type File = {
  path: () => string;
  content: () => Promise<ReadStream>;
  write: (content: ReadStream) => Promise<void>;
};

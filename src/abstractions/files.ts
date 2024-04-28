import { File } from "./file";

export type Files = {
  list: (extensions?: string[]) => Promise<File[]>;
};

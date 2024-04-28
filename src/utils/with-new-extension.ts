import path from "path";

export const withNewExtenstion = (filePath: string, newExtension: string): string => {
  if (newExtension.startsWith(".") === false) {
    throw new Error("Extension should start with dot");
  }

  // Get the directory and base name of the file
  const directory = path.dirname(filePath);
  const basename = path.basename(filePath, path.extname(filePath));

  // Concatenate the directory, basename, and new extension
  const newFilePath = path.join(directory, `${basename}${newExtension}`);

  return newFilePath;
};

import { getSelectedFinderVideos } from "./get-selected-finder-videos";
export { runFffmpegCommand } from "./run-ffmpeg-command";
export { withNewExtenstion } from "./with-new-extension";

export const getSelectedVideos = async (): Promise<string[]> => {
  const finderVideos = await getSelectedFinderVideos();
  return finderVideos.split(", ");
};

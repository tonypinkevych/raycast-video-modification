import { Toast, showToast } from "@raycast/api";
import * as path from "path";
import { Ffmpeg } from "./objects/ffmpeg";
import { SelectedFinderFiles } from "./objects/selected-finder.videos";
import { withNewExtenstion } from "./utils/with-new-extension";

export default async function Command(props: { arguments: { width: string; height: string } }) {
  const { width, height } = props.arguments;

  if (!width && !height) {
    await showToast({ title: "Width or Height should be proivded", style: Toast.Style.Failure });
    return;
  }

  const files = await new SelectedFinderFiles().list();

  if (files.length === 0) {
    await showToast({ title: "Please select any video in Finder", style: Toast.Style.Failure });
    return;
  }

  const ffmpeg = new Ffmpeg({
    onStatusChange: async (status) => {
      await showToast({ title: status, style: Toast.Style.Animated });
    },
  });

  for (const video of files) {
    try {
      const videoPath = video.path();
      const sourceDirPath = path.dirname(videoPath);
      const videoName = path.basename(videoPath, path.extname(videoPath));
      const extension = path.extname(videoPath);
      const targetVideoPath = path.join(
        sourceDirPath,
        withNewExtenstion(`${videoName}-${width}x${height}${extension}`, extension),
      );
      await ffmpeg.exec({
        input: videoPath,
        params: [
          !!width && !height ? `-vf scale=${width}:-2` : undefined,
          !width && !!height ? `-vf scale=-2:${height}` : undefined,
          !!width && !!height ? `-vf scale=${width}:${height}` : undefined,
        ],
        output: targetVideoPath,
      });
    } catch (err: any) {
      await showToast({ title: err.message, style: Toast.Style.Failure });
    }
  }

  await showToast({ title: "All videos processed", style: Toast.Style.Success });
}

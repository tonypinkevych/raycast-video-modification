import { Toast, showToast } from "@raycast/api";
import * as path from "path";
import { Ffmpeg } from "./objects/ffmpeg";
import { Gif } from "./objects/gif";
import { SelectedFinderFiles } from "./objects/selected-finder.videos";
import { Video } from "./objects/video";
import { loggable } from "./utils/loggable";

export default async function Command(props: { arguments: { width: string; height: string } }) {
  const { width: providedWidth, height: providedHeight } = props.arguments;

  if (!providedWidth && !providedHeight) {
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
    const width = !!providedWidth ? parseInt(providedWidth, 10) : undefined;
    const height = !!providedHeight ? parseInt(providedHeight, 10) : undefined;

    try {
      const extension = path.extname(video.path());
      if (extension === ".gif") {
        await loggable(new Gif(video, ffmpeg)).encode({ width, height });
      } else {
        await loggable(new Video(video, ffmpeg)).encode({ width, height });
      }
    } catch (err: any) {
      await showToast({ title: err.message, style: Toast.Style.Failure });
      return;
    }
  }

  await showToast({ title: "All videos processed", style: Toast.Style.Success });
}

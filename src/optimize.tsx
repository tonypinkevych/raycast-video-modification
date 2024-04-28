import { Toast, showToast } from "@raycast/api";
import * as path from "path";
import { Ffmpeg } from "./objects/ffmpeg";
import { Ffprobe } from "./objects/ffprobe";
import { SelectedFinderFiles } from "./objects/selected-finder.videos";
import { Video } from "./objects/video";
import { loggable } from "./utils/loggable";

export default async function Command(props: { arguments: { preset: "smallest-size" | "optimal" | "best-quality" } }) {
  const { preset } = props.arguments;
  const files = await new SelectedFinderFiles().list();

  if (files.length === 0) {
    await showToast({ title: "Please select any video in Finder", style: Toast.Style.Failure });
    return;
  }

  const ffmpeg = loggable(
    new Ffmpeg(
      loggable(
        new Ffprobe({
          onStatusChange: async (status) => {
            await showToast({ title: status, style: Toast.Style.Animated });
          },
        }),
      ),
      {
        onStatusChange: async (status) => {
          await showToast({ title: status, style: Toast.Style.Animated });
        },
        onProgressChange: (progress) => {
          console.log(">>>", progress);
        },
      },
    ),
  );

  for (const video of files) {
    try {
      const extension = path.extname(video.path());
      if (extension === ".gif") {
        throw new Error("Does not applicable to GIFs yet");
      } else {
        await loggable(new Video(video, ffmpeg)).encode({ preset });
      }
    } catch (err: any) {
      await showToast({ title: err.message, style: Toast.Style.Failure });
      return;
    }
  }

  await showToast({ title: "All videos processed", style: Toast.Style.Success });
}

import { Toast as RaycastToast } from "@raycast/api";
import { Ffmpeg } from "./objects/ffmpeg";
import { Ffprobe } from "./objects/ffprobe";
import { Gif } from "./objects/gif";
import { SafeNumber } from "./objects/safe.number";
import { SelectedFinderFiles } from "./objects/selected-finder.files";
import { Toast } from "./objects/toast";
import { Video } from "./objects/video";

export default async function Command(props: { arguments: { width: string; height: string } }) {
  const { width: providedWidth, height: providedHeight } = props.arguments;
  const toast = new Toast();
  const ffmpeg = new Ffmpeg(
    new Ffprobe({
      onStatusChange: async (status) => {
        await toast.show({ title: status, style: RaycastToast.Style.Animated });
      },
    }),
    {
      onStatusChange: async (status) => {
        await toast.show({ title: status, style: RaycastToast.Style.Animated });
      },
      onProgressChange: async (progress) => {
        await toast.updateProgress(Math.round(progress * 100));
      },
    },
  );

  if (!providedWidth && !providedHeight) {
    await toast.show({ title: "Width or Height should be provided", style: RaycastToast.Style.Failure });
    return;
  }

  try {
    const files = await new SelectedFinderFiles().list();

    if (files.length === 0) {
      await toast.show({ title: "Please select any Video in Finder", style: RaycastToast.Style.Failure });
      return;
    }

    for (const file of files) {
      const width = new SafeNumber(providedWidth).toInt();
      const height = new SafeNumber(providedHeight).toInt();

      if (file.extension() === ".gif") {
        await new Gif(file, ffmpeg).encode({ width, height });
        continue;
      }

      await new Video(file, ffmpeg).encode({ width, height });
    }

    await toast.show({ title: "All Videos are Processed", style: RaycastToast.Style.Success });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err);
      await toast.show({ title: err.message, style: RaycastToast.Style.Success });
    }
  }
}

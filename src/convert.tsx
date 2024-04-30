import { Toast as RaycastToast } from "@raycast/api";
import { Ffmpeg } from "./objects/ffmpeg";
import { Ffprobe } from "./objects/ffprobe";
import { Gif } from "./objects/gif";
import { FinderIsNotFrontmostApp, SelectedFinderFiles } from "./objects/selected-finder.files";
import { Toast } from "./objects/toast";
import { Video } from "./objects/video";

export default async function Command(props: { arguments: { format: "mp4" | "webm" | "gif" } }) {
  const { format } = props.arguments;
  const toast = new Toast();
  const files = new SelectedFinderFiles();
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

  try {
    const selectedFiles = await files.list();

    if (selectedFiles.length === 0) {
      throw new Error("Please select any Video in Finder");
    }

    for (const file of selectedFiles) {
      if (format === "gif") {
        await new Gif(file, ffmpeg).encode();
        continue;
      }

      await new Video(file, ffmpeg).encode({ format });
    }

    await toast.show({ title: "All Videos are Processed", style: RaycastToast.Style.Success });
  } catch (err) {
    if (err instanceof FinderIsNotFrontmostApp) {
      await toast.show({ title: "Please put Finder in focus and try again", style: RaycastToast.Style.Failure });
      return;
    }

    if (err instanceof Error) {
      console.error(err);
      await toast.show({ title: err.message, style: RaycastToast.Style.Failure });
    }
  }
}

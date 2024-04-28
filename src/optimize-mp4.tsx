import { Toast, showToast } from "@raycast/api";
import * as path from "path";
import { getSelectedVideos, runFffmpegCommand, withNewExtenstion } from "./utils";
import { getCli } from "./utils/cli";

export default async function Command(props: { arguments: { preset: "veryslow" | "medium" | "veryfast" } }) {
  const { preset } = props.arguments;
  const selectedVideos = await getSelectedVideos();

  if (selectedVideos.length === 0) {
    await showToast({ title: "Please select any video in Finder", style: Toast.Style.Failure });
    return;
  }

  const ffmpegCli = await getCli(async (status) => {
    await showToast({ title: status, style: Toast.Style.Animated });
  });

  for (const video of selectedVideos) {
    const sourceDirPath = path.dirname(video);
    const videoName = path.basename(video, path.extname(video));
    const extension = path.extname(video);
    const targetVideo = path.join(sourceDirPath, withNewExtenstion(`${videoName}-${preset}${extension}`, extension));

    if (video === targetVideo) {
      await showToast({ title: "Selected video cannot be optimized", style: Toast.Style.Failure });
      return;
    }

    await showToast({ title: `Processing "${videoName}"`, style: Toast.Style.Animated });
    const command = [
      `"${ffmpegCli}"`,
      // accept all prompts
      "-y",
      `-i "${video}"`,
      "-c:v libx264",
      `-preset ${preset}`,
      `"${targetVideo}"`,
    ].join(" ");
    await runFffmpegCommand(command);
  }

  await showToast({ title: "All videos processed", style: Toast.Style.Success });
}

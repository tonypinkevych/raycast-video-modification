import { Toast, showToast } from "@raycast/api";
import * as path from "path";
import { getSelectedVideos, runFffmpegCommand, withNewExtenstion } from "./utils";
import { getCli } from "./utils/cli";

export default async function Command(props: { arguments: { width: string; height: string } }) {
  const { width, height } = props.arguments;

  if (!width && !height) {
    await showToast({ title: "Width or Height should be proivded", style: Toast.Style.Failure });
    return;
  }

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
    const targetVideo = path.join(
      sourceDirPath,
      withNewExtenstion(`${videoName}-${width}x${height}${extension}`, extension),
    );

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
      !!width && !height ? `-vf scale=${width}:-2` : undefined,
      !width && !!height ? `-vf scale=-2:${height}` : undefined,
      !!width && !!height ? `-vf scale=${width}:${height}` : undefined,
      `"${targetVideo}"`,
    ]
      .filter((item) => item != null)
      .join(" ");
    await runFffmpegCommand(command);
  }

  await showToast({ title: "All videos processed", style: Toast.Style.Success });
}

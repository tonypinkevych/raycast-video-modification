import { Action, ActionPanel, List, Toast, showToast } from "@raycast/api";
import * as path from "path";
import { useState } from "react";
import { Ffmpeg } from "./objects/ffmpeg";
import { SelectedFinderFiles } from "./objects/selected-finder.videos";
import { loggable } from "./utils/loggable";
import { withNewExtenstion } from "./utils/with-new-extension";

export default function Command() {
  const [isLoading, setIsLoading] = useState(false);

  const files = loggable(new SelectedFinderFiles());
  const ffmpeg = loggable(
    new Ffmpeg({
      onStatusChange: async (status) => {
        await showToast({ title: status, style: Toast.Style.Animated });
      },
    }),
  );

  const encodeMp4 = async () => {
    setIsLoading(true);
    const selectedVideos = await files.list();

    if (selectedVideos.length === 0) {
      await showToast({ title: "Please select any video in Finder", style: Toast.Style.Failure });
      return;
    }

    for (const video of selectedVideos) {
      try {
        const videoPath = video.path();
        const sourceDirPath = path.dirname(videoPath);
        const videoName = path.basename(videoPath);
        const targetVideoPath = path.join(sourceDirPath, withNewExtenstion(videoName, ".mp4"));
        await ffmpeg.exec({
          input: videoPath,
          output: targetVideoPath,
        });
      } catch (err: any) {
        await showToast({
          title: err.message,
          style: Toast.Style.Failure,
        });
      }
    }

    await showToast({ title: "All videos processed", style: Toast.Style.Success });
    setIsLoading(false);
  };

  const encodeWebm = async () => {
    setIsLoading(true);
    const selectedVideos = await files.list();

    if (selectedVideos.length === 0) {
      await showToast({ title: "Please select any video in Finder", style: Toast.Style.Failure });
      return;
    }

    for (const video of selectedVideos) {
      try {
        const videoPath = video.path();
        const sourceDirPath = path.dirname(videoPath);
        const videoName = path.basename(videoPath);
        const targetVideoPath = path.join(sourceDirPath, withNewExtenstion(videoName, ".webm"));
        await ffmpeg.exec({
          input: videoPath,
          output: targetVideoPath,
        });
      } catch (err: any) {
        await showToast({
          title: err.message,
          style: Toast.Style.Failure,
        });
      }
    }

    await showToast({ title: "All videos processed", style: Toast.Style.Success });
    setIsLoading(false);
  };

  const encodeGif = async () => {
    setIsLoading(true);
    const selectedVideos = await files.list();

    if (selectedVideos.length === 0) {
      await showToast({ title: "Please select any video in Finder", style: Toast.Style.Failure });
      return;
    }

    for (const video of selectedVideos) {
      try {
        const videoPath = video.path();
        const sourceDirPath = path.dirname(videoPath);
        const videoName = path.basename(videoPath);
        const targetVideoPath = path.join(sourceDirPath, withNewExtenstion(videoName, ".gif"));
        await ffmpeg.exec({
          input: videoPath,
          output: targetVideoPath,
        });
      } catch (err: any) {
        await showToast({
          title: err.message,
          style: Toast.Style.Failure,
        });
      }
    }

    await showToast({ title: "All videos processed", style: Toast.Style.Success });
    setIsLoading(false);
  };

  return (
    <List isLoading={isLoading}>
      <List.Item
        icon="list-icon.png"
        title="mp4"
        actions={
          <ActionPanel>
            <Action title="Start encoding" onAction={encodeMp4} />
          </ActionPanel>
        }
      />

      <List.Item
        icon="list-icon.png"
        title="webm"
        actions={
          <ActionPanel>
            <Action title="Start encoding" onAction={encodeWebm} />
          </ActionPanel>
        }
      />

      <List.Item
        icon="list-icon.png"
        title="gif"
        actions={
          <ActionPanel>
            <Action title="Start encoding" onAction={encodeGif} />
          </ActionPanel>
        }
      />
    </List>
  );
}

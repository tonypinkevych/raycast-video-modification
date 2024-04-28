import { Action, ActionPanel, List, Toast, showToast } from "@raycast/api";
import { useState } from "react";
import { Ffmpeg } from "./objects/ffmpeg";
import { Ffprobe } from "./objects/ffprobe";
import { Gif } from "./objects/gif";
import { SelectedFinderFiles } from "./objects/selected-finder.videos";
import { Video } from "./objects/video";
import { loggable } from "./utils/loggable";

export default function Command() {
  const [isLoading, setIsLoading] = useState(false);

  const files = loggable(new SelectedFinderFiles());
  const ffmpeg = loggable(
    new Ffmpeg(loggable(new Ffprobe()), {
      onStatusChange: async (status) => {
        await showToast({ title: status, style: Toast.Style.Animated });
      },
      onProgressChange: (progress) => {
        console.log(">>>", progress);
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
        await loggable(new Video(video, ffmpeg)).encode({ format: "mp4" });
      } catch (err: any) {
        await showToast({
          title: err.message,
          style: Toast.Style.Failure,
        });
        return;
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
        await loggable(new Video(video, ffmpeg)).encode({ format: "webm" });
      } catch (err: any) {
        await showToast({
          title: err.message,
          style: Toast.Style.Failure,
        });
        return;
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
        await loggable(new Gif(video, ffmpeg)).encode();
      } catch (err: any) {
        await showToast({
          title: err.message,
          style: Toast.Style.Failure,
        });
        return;
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

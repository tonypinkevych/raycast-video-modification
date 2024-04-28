import { Action, ActionPanel, List, Toast, showToast, useNavigation } from "@raycast/api";
import { getProgressIcon } from "@raycast/utils";
import { useState } from "react";
import { Ffmpeg } from "./objects/ffmpeg";
import { Ffprobe } from "./objects/ffprobe";
import { Gif } from "./objects/gif";
import { SelectedFinderFiles } from "./objects/selected-finder.videos";
import { Video } from "./objects/video";
import { loggable } from "./utils/loggable";

export default function Command() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [type, setType] = useState<"mp4" | "webm" | "gif" | undefined>();
  const { pop } = useNavigation();

  const files = loggable(new SelectedFinderFiles());
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
          setProgress(progress);
        },
      },
    ),
  );

  const encodeMp4 = async () => {
    setType("mp4");
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
    setProgress(undefined);
    setType(undefined);
    pop();
  };

  const encodeWebm = async () => {
    setType("webm");
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
    setProgress(undefined);
    setType(undefined);
    pop();
  };

  const encodeGif = async () => {
    setType("gif");
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
    setProgress(undefined);
    setType(undefined);
    pop();
  };

  return (
    <List isLoading={isLoading}>
      <List.Item
        icon={progress != null && type === "mp4" ? getProgressIcon(progress, "#374FD5") : "list-icon.png"}
        title="mp4"
        actions={
          <ActionPanel>
            <Action title="Start encoding" onAction={encodeMp4} />
          </ActionPanel>
        }
      />

      <List.Item
        icon={progress != null && type === "webm" ? getProgressIcon(progress, "#374FD5") : "list-icon.png"}
        title="webm"
        actions={
          <ActionPanel>
            <Action title="Start encoding" onAction={encodeWebm} />
          </ActionPanel>
        }
      />

      <List.Item
        icon={progress != null && type === "gif" ? getProgressIcon(progress, "#374FD5") : "list-icon.png"}
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

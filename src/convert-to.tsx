import { Action, ActionPanel, List, Toast, showToast } from "@raycast/api";
import { exec } from "child_process";
import * as path from "path";
import { useState } from "react";
import { getSelectedVideos, withNewExtenstion } from "./utils";
import { getCli } from "./utils/cli";

export default function Command() {
  const [isLoading, setIsLoading] = useState(false);

  const encodeMp4 = async () => {
    setIsLoading(true);
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
      const videoName = path.basename(video);

      await showToast({ title: `Processing "${videoName}"`, style: Toast.Style.Animated });

      const targetVideo = path.join(sourceDirPath, withNewExtenstion(videoName, ".mp4"));

      if (video === targetVideo) {
        await showToast({
          title: "Selected video cannot be converted into the same format",
          style: Toast.Style.Failure,
        });
        return;
      }

      await new Promise<void>((resolve, reject) => {
        exec(`"${ffmpegCli}" -i "${video}" "${targetVideo}"`, (err, stdout, stderr) => {
          if (err != null) {
            console.error(err);
            reject();
            return;
          }

          console.log("!!! stdout", stdout);
          console.log("!!! stderr", stderr);
          resolve();
        });
      });
    }

    await showToast({ title: "All videos processed", style: Toast.Style.Success });
    setIsLoading(false);
  };

  const encodeWebm = async () => {
    setIsLoading(true);
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
      const videoName = path.basename(video);

      await showToast({ title: `Processing "${videoName}"`, style: Toast.Style.Animated });

      const targetVideo = path.join(sourceDirPath, withNewExtenstion(videoName, ".webm"));

      if (video === targetVideo) {
        await showToast({
          title: "Selected video cannot be converted into the same format",
          style: Toast.Style.Failure,
        });
        return;
      }

      await new Promise<void>((resolve, reject) => {
        exec(`"${ffmpegCli}" -i "${video}" "${targetVideo}"`, (err, stdout, stderr) => {
          if (err != null) {
            console.error(err);
            reject();
            return;
          }

          console.log("!!! stdout", stdout);
          console.log("!!! stderr", stderr);
          resolve();
        });
      });
    }

    await showToast({ title: "All videos processed", style: Toast.Style.Success });
    setIsLoading(false);
  };

  const encodeGif = async () => {
    setIsLoading(true);
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
      const videoName = path.basename(video);

      const targetVideo = path.join(sourceDirPath, withNewExtenstion(videoName, ".gif"));

      if (video === targetVideo) {
        await showToast({
          title: "Selected video cannot be converted into the same format",
          style: Toast.Style.Failure,
        });
        return;
      }

      await new Promise<void>((resolve, reject) => {
        exec(`"${ffmpegCli}" -i "${video}" "${targetVideo}"`, (err, stdout, stderr) => {
          if (err != null) {
            console.error(err);
            reject();
            return;
          }

          console.log("!!! stdout", stdout);
          console.log("!!! stderr", stderr);
          resolve();
        });
      });
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

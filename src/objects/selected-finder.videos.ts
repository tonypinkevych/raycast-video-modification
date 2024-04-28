import { runAppleScript } from "@raycast/utils";
import { Files } from "../abstractions";
import { LocalFile } from "./local.file";

export class SelectedFinderFiles implements Files {
  /**
   * Gets currently selected videos in Finder.
   * Code taken from the `Image Modification` Raycast extension.
   * @url https://github.com/raycast/extensions/blob/eb7ae0ef3871cb13558f738dde3c31efe7b04b24/extensions/sips/src/utilities/utils.ts#L36
   *
   * @returns A promise resolving to the comma-separated list of video paths as a string.
   */
  list: Files["list"] = async (extensions = ["MP4", "WEBM", "GIF", "MOV"]) => {
    const paths = await runAppleScript(
      `set videoTypes to {${extensions.map((item) => `"${item}"`).join(", ")}}

      tell application "Finder"
        set theSelection to selection

        if theSelection is {} and (count Finder windows) > 0 then
          repeat with i from 1 to (count Finder windows)
            activate window i
            set theSelection to selection

            set selectionKinds to {}
            repeat with j from 1 to (count theSelection)
              set selectionKinds to selectionKinds & kind of (item j of theSelection)
            end repeat

            set containsVideo to false
            repeat with videoType in videoTypes
              if selectionKinds contains videoType then
                set containsVideo to true
                exit repeat
              end if
            end repeat
          end repeat
        end if

        if theSelection is {} then
          return
        else if (theSelection count) is equal to 1 then
          repeat with videoType in videoTypes
            if (kind of the first item of theSelection) contains videoType then
              return the POSIX path of (theSelection as alias)
              exit repeat
            end if
          end repeat
        else
          set thePaths to {}
          repeat with i from 1 to (theSelection count)
            repeat with videoType in videoTypes
              if (kind of (item i of theSelection)) contains videoType then
                copy (POSIX path of (item i of theSelection as alias)) to end of thePaths
                exit repeat
              end if
            end repeat
          end repeat
          return thePaths
        end if
      end tell`,
    );

    return paths.split(", ").map((filePath) => new LocalFile(filePath));
  };
}

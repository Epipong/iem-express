import { ImagingEdgeMobile } from "../entities/imaging-edge-mobile";
import fs from "fs";
import path from "path";
import { singleBar as bar } from "../../entities/single-bar";
import { extension } from "../interfaces/extension";

class ImagingEdgeSrvc {
  constructor(private iem: ImagingEdgeMobile) {}

  /**
   * get the date format yyyy-MM-dddd.
   * @param date
   * @returns the date string formatted.
   */
  private getYearMonthdayFormat(date: Date) {
    const dateString = date.toISOString();
    return dateString.substring(0, dateString.indexOf("T"));
  }

  /**
   * get the file name from the path
   * @param file file name path.
   * @returns the file name;
   */
  private getFileName(file: string) {
    return file.split("/").pop() || "";
  }

  /**
   * create the path folder recursively.
   * @param folder folder to create if not exist.
   * @returns
   */
  private createFolder(folder: string): string {
    const fullTargetPath = path.resolve(this.iem.targetPath, folder);
    if (!fs.existsSync(fullTargetPath)) {
      fs.mkdirSync(fullTargetPath, { recursive: true });
    }
    return fullTargetPath;
  }

  /**
   * copy the source file to the target location.
   * @param source file path to copy.
   * @param target target location to paste.
   * @param file target file name.
   * @param force if true, force to copy existing files.
   */
  private copyFile({
    source,
    target,
    file,
    force,
  }: {
    source: string;
    target: string;
    file: string;
    force?: boolean;
  }) {
    const targetFilePath = path.resolve(target, this.getFileName(file));
    if (force || !fs.existsSync(targetFilePath)) {
      fs.cpSync(source, targetFilePath);
    }
  }

  /**
   * import the files by extension and folder given.
   * @param folder folder path of the files.
   * @param ext extension of the file.
   * @param force if true, force to copy existing files.
   */
  public importFilesByExt({
    folder,
    ext,
    force,
  }: {
    folder: string;
    ext: extension;
    force?: boolean;
  }) {
    const dir = path.resolve(this.iem.sourcePath, folder);
    const files = fs
      .readdirSync(dir, {
        recursive: true,
      })
      .filter((file) => (file as string).endsWith(`.${ext}`));
    bar.start(files.length, 0);
    for (const file of files as string[]) {
      const filePath = path.resolve(dir, file);
      const { mtime } = fs.statSync(filePath);
      const dateFmt = this.getYearMonthdayFormat(mtime);
      const targetFolder = this.createFolder(`${dateFmt}/${ext}`);
      this.copyFile({ source: filePath, target: targetFolder, file, force });
      bar.increment({ filename: this.getFileName(file) });
    }
    bar.stop();
  }

  /**
   * import images, raw and videos files.
   * @param force if true, force to copy existing files.
   */
  public importFiles(force: boolean = false) {
    this.importFilesByExt({ folder: "DCIM", ext: "JPG", force });
    this.importFilesByExt({ folder: "DCIM", ext: "ARW", force });
    this.importFilesByExt({
      folder: "PRIVATE/M4ROOT",
      ext: "MP4",
      force,
    });
  }

  /**
   * export images, raw and videos files.
   * @param force if true, force to copy existing files.
   */
  public exportFiles(force: boolean = false) {
    const files = fs.readdirSync(this.iem.sourcePath, { recursive: true });
    bar.start(files.length, 0);
    for (const file of files) {
      const sourcePath = path.resolve(this.iem.sourcePath, file as string);
      const targetPath = path.resolve(this.iem.targetPath, file as string);
      if (force || !fs.existsSync(targetPath)) {
        fs.cpSync(sourcePath, targetPath, { recursive: true });
      }
      bar.increment({ filename: this.getFileName(file as string) });
    }
    bar.stop();
  }
}

export { ImagingEdgeSrvc };

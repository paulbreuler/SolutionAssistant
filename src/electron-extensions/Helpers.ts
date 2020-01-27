export default class Helpers {
  static getFileExtension(filename: string) {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  }

  static splitZipFileString(str: string) {
    let file = str.split("\\").pop();
    return file;
  }

  // Convert Windows path into Linux path type
  static convertPathToShellPath(path: any) {
    let match = path.match(/[a-zA-Z]:\\/i);
    let driveLetter = match[0].split(":")[0];

    return path
      .replace(/[a-zA-Z]:\\/i, "/" + driveLetter + "/")
      .replace(/\\/g, "/");
  }
}

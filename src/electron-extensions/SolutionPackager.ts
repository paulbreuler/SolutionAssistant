export {};
import Helpers from "./Helpers";
const electron = require("electron");
import { log, win, isDev, db, app } from "../../public/electron";
const { ipcMain, process } = electron;
export default class SolutionPackager {
  static retrieveDefaultExtract(e: any) {
    win.webContents.send("packager:defaultExtract", {
      packagerSettings: {
        presetName: "Default",
        action: "extract", // {Extract|Pack}
        zipFile: "", // <file path>
        zipFilePath: `${app.getPath("documents")}\\${
          app.name
        }\\solutions\\PackedSolutions`,
        folder: `${app.getPath("documents")}\\${
          app.name
        }\\solutions\\ExtractedSolution`, // <folder path>
        packageType: "", // {Unmanaged|Managed|Both}
        allowWrite: "", // {Yes|No}
        allowDelete: "", // {Yes|No|Prompt}
        clobber: "",
        errorLevel: "", // {Yes|No|Prompt}
        map: "", // <file path>
        nologo: "",
        log: "", // <file path>
        sourceLoc: "", // <string>
        localize: ""
      }
    });
  }

  static viewInExplorer(e: any, packagerSettings: any) {
    let outputPath = `${
      packagerSettings.zipFilePath
    }\\${Helpers.splitZipFileString(packagerSettings.zipFile)}`;
    let extractFolderPath = `${packagerSettings.folder}`;

    // User input does not require .zip. Ensure it's added if not present to prevent failure.
    if (Helpers.getFileExtension(packagerSettings.zipFile) === "") {
      outputPath += ".zip";
    }

    electron.shell.showItemInFolder(
      packagerSettings.action === "pack" ? outputPath : extractFolderPath
    );
  }

  static execute(e: any, packagerSettings: any) {
    const childProcess = require("child_process"); // The power of Node.JS
    log.info(`Dynamics 365 solution to unpack: ${packagerSettings.zipFile}`);

    let params = SolutionPackager.getPackagerParameters(packagerSettings);

    let solutoinPackagerPath = null;
    if (isDev) {
      solutoinPackagerPath = `./assets/powershell/SolutionPackager.exe `;
    } else {
      //TODO: Consider OS when creating path
      solutoinPackagerPath = `${process.resourcesPath}\\powershell\\SolutionPackager.exe`;
      //solutoinPackagerPath = convertPathToShellPath(solutoinPackagerPath);
    }

    log.verbose(
      `About to run solution packager shell command ${solutoinPackagerPath} \n\t- parameters: ${params}`
    );

    const ls = childProcess.spawn(solutoinPackagerPath, params);

    let output: any = [];
    ls.stdout.on("data", function(data: any) {
      log.info("SolutionPackager: stdout: <" + data + "> ");
      // appendToDroidOutput(data);

      // TODO Handle edge cases i.e. Solution package type did not match requested type.
      // Attempting to unpack as managed when already exists as unmanaged

      output.push(data.toString());
      if (`${data}`.includes("Delete")) {
        ls.stdin.write("No\n");
        log.verbose(
          "Prevent SolutionPackager.exe file delete. stdout message: " +
            data.toString()
        );
      }
    });

    ls.stderr.on("data", function(data: any) {
      log.error("Error packaging or extracting solution: " + data);
    });

    ls.on("close", function(code: any) {
      // console.log('child process exited with code ' + code);
      if (code === 0) {
        win.webContents.send("packager:output", "success", output);
        log.info(`SolutionPacakager output: ${output.join("\n")}`);
      } else {
        win.webContents.send("packager:output", "error", code);
      }
    });

    ls.on("error", (code: any) => {
      log.error(
        `child process exited with code ${code} \n\t ${code.message} \n\t ${code.stack}`
      );
    });
  }

  static getPackagerParameters(packagerSettings: any) {
    let parameters: any = [];
    let param: string = "";

    // If we are packing the solution combine zipFilePath and zipFile for command line arg
    // Electron throws error when trying to use
    if (packagerSettings.action === "pack") {
      let zipFile = `${
        packagerSettings.zipFilePath
      }/${Helpers.splitZipFileString(packagerSettings.zipFile)}`;
      log.info(`zipFile: ${zipFile}`);
      packagerSettings.zipFile = zipFile;

      delete packagerSettings.zipFilePath;

      // Add file extension if it's missing.
      if (Helpers.getFileExtension(packagerSettings.zipFile) === "") {
        packagerSettings.zipFile += ".zip";
      }
    } else {
      delete packagerSettings.zipFilePath;
    }

    let isValid = true;
    for (var key in packagerSettings) {
      if (
        packagerSettings[key] !== "" &&
        packagerSettings[key] !== undefined &&
        !parameters.includes(key)
      ) {
        switch (key) {
          case "presetName":
          case "newPresetName":
            param = "";
            isValid = false;
            break;
          case "clobber":
          case "localize":
            param = `${packagerSettings[key]}`;
            break;
          case "folder":
          case "zipFile":
            // Quotes to handle paths with spaces
            param = `/${key}:${packagerSettings[key]}`;
            break;
          default:
            param = `/${key}:${packagerSettings[key]}`;
        }
        if (isValid) {
          parameters.push(param);
        } else {
          isValid = true;
        }
      }
    }

    return parameters;
  }
}

/*
  Retrieve Settings
*/
ipcMain.on("packagerPresets:retrieve", function(e: any) {
  db.find({ presetName: { $exists: true } }, function(err: any, presets: any) {
    win.webContents.send("packagerPresets:acquired", presets);
  });
});

/*
    Update Settings
  
    Preset:
    {
      _id: string,
      presetName: string,
      action: string, // {"extract"|"pack"}
      zipFile: string, // <file path>
      zipFilePath: string,
      folder: string, // <folder path>
      packageType: string, // {"unmanaged"|"managed"|"both"}
      allowWrite: string, // {"yes"|"no"}
      allowDelete: string, // {"yes"|"no"|"prompt"}
      clobber: string,
      errorLevel: string, // {"yes"|"no"|"prompt"}
      map: string, // <file path>
      nologo: string,
      log: string, // <file path>
      sourceLoc: string, // <string>
      localize: string
    }
  */
ipcMain.on("packagerPresets:update", function(e: any, preset: any) {
  db.update(
    {
      presetName: `${preset.presetName}`
    },
    {
      $set: { ...preset }
    },
    {},
    function(err: any, numReplaced: any) {
      // Update callbackcode here
      // db.find({ presetName: { $exists: true } }, function(
      //   err,
      //   presets
      // ) {
      //   win.webContents.send("packagerPresets:acquired", presets);
      // });
    }
  );
});

ipcMain.on("packagerPresets:insert", function(e: any, preset: any) {
  db.insert({ ...preset }, function(err: any, newDoc: any) {});
});

import Main from "../../public/electron-main";
export class SolutionPacakager {}
// import Helpers from "./Helpers";
// const path = require("path");
// const electron = require("electron");
// const fs = require("fs");
// //import { win, isDev, db, app } from "../../public/electron";
// import ElectronLog from "electron-log";
// const { ipcMain } = electron;
// const process = require("process");
// import childProcess from "child_process";

// export default class SolutionPackager {
//   static retrieveDefaultExtract(e: any) {
//     win.webContents.send("packager:defaultExtract", {
//       packagerSettings: {
//         presetName: "Default",
//         action: "extract", // {Extract|Pack}
//         zipFile: "", // <file path>
//         zipFilePath: `${app.getPath("documents")}\\${
//           app.name
//         }\\solutions\\PackedSolutions`,
//         folder: `${app.getPath("documents")}\\${
//           app.name
//         }\\solutions\\ExtractedSolution`, // <folder path>
//         packageType: "", // {Unmanaged|Managed|Both}
//         allowWrite: "", // {Yes|No}
//         allowDelete: "", // {Yes|No|Prompt}
//         clobber: "",
//         errorLevel: "", // {Yes|No|Prompt}
//         map: "", // <file path>
//         nologo: "",
//         log: "", // <file path>
//         sourceLoc: "", // <string>
//         localize: ""
//       }
//     });
//   }

//   static execute(e: any, packagerSettings: any) {
//     //const childProcess = require("child_process"); // The power of Node.JS
//     ElectronLog.info(
//       `Preparing to run SolutionPackager on Dynamics 365 solution: ${packagerSettings.zipFile}`
//     );

//     let params: any = null;
//     try {
//       params = SolutionPackager.getPackagerParameters(packagerSettings);
//     } catch (e) {
//       if (e instanceof SolutionPackagerError) {
//         ElectronLog.error((<SolutionPackagerError>e).message);
//       } else {
//         ElectronLog.error(`${(<Error>e).message} \n ${(<Error>e).stack}`);
//       }

//       win.webContents.send("packager:output", "error", (<Error>e).message);
//       return;
//     }

//     if (!params) {
//       win.webContents.send("packager:output", "error", "Invalid parameters");
//       return;
//     }

//     let solutionPackagerPath: string = "";
//     if (isDev) {
//       solutionPackagerPath = `./assets/powershell/SolutionPackager.exe `;
//     } else {
//       //TODO: Consider OS when creating path
//       solutionPackagerPath = `${process.resourcesPath}\\powershell\\SolutionPackager.exe`; // path.join(__dirname, "\\resources\\powershell\\SolutionPackager.exe");
//       //solutoinPackagerPath = convertPathToShellPath(solutoinPackagerPath);
//     }

//     ElectronLog.verbose(
//       `Running SolutionPackager shell command ${solutionPackagerPath} \n\t- parameters: ${params}`
//     );

//     const spawnedProcess = childProcess.spawn(solutionPackagerPath, params);

//     let output: any = [];

//     spawnedProcess.stdout.on("data", function(data: any) {
//       ElectronLog.info("SolutionPackager: stdout: <" + data + "> ");

//       // TODO Handle edge cases i.e. Solution package type did not match requested type.
//       // Attempting to unpack as managed when already exists as unmanaged

//       output.push(data.toString());
//       if (`${data}`.includes("Delete")) {
//         spawnedProcess.stdin.write("No\n");
//         ElectronLog.verbose(
//           "Prevent SolutionPackager.exe file delete. stdout message: " +
//             data.toString()
//         );
//       }
//     });

//     spawnedProcess.stderr.on("data", function(data: any) {
//       ElectronLog.error("Error packaging or extracting solution: " + data);
//     });

//     spawnedProcess.on("close", function(code: any) {
//       // console.log('child process exited with code ' + code);
//       if (code === 0) {
//         win.webContents.send("packager:output", "success", output);
//         ElectronLog.info(`SolutionPacakager output: ${output.join("\n")}`);
//       } else {
//         win.webContents.send("packager:output", "error", code);
//         ElectronLog.error(`SolutionPacakager output: ${output.join("\n")}`);
//       }
//     });

//     spawnedProcess.on("error", (code: any) => {
//       ElectronLog.error(
//         `child process exited with code ${code} \n\t ${code.message} \n\t ${code.stack}`
//       );
//     });
//   }

//   static getPackagerParameters(packagerSettings: any) {
//     let parameters: any = [];
//     let param: string = "";

//     // If we are packing the solution combine zipFilePath and zipFile for command line arg
//     // Electron throws error when trying to use
//     if (packagerSettings.action === "pack") {
//       if (packagerSettings.zipFilePath === "") {
//         throw new SolutionPackagerError("Output path not specified");
//       }

//       if (!fs.existsSync(packagerSettings.zipFilePath)) {
//         throw new SolutionPackagerError(
//           `${packagerSettings.zipFilePath} - is an invalid path.`
//         );
//       }

//       let zipFile = `${
//         packagerSettings.zipFilePath
//       }/${Helpers.splitZipFileString(packagerSettings.zipFile)}`;
//       ElectronLog.info(`zipFile: ${zipFile}`);
//       packagerSettings.zipFile = zipFile;

//       delete packagerSettings.zipFilePath;

//       // Add file extension if it's missing.
//       if (Helpers.getFileExtension(packagerSettings.zipFile) === "") {
//         packagerSettings.zipFile += ".zip";
//       }
//     } else {
//       delete packagerSettings.zipFilePath;
//     }

//     let isValid = true;
//     for (var key in packagerSettings) {
//       if (
//         packagerSettings[key] !== "" &&
//         packagerSettings[key] !== undefined &&
//         !parameters.includes(key)
//       ) {
//         switch (key) {
//           case "presetName":
//           case "newPresetName":
//             param = "";
//             isValid = false;
//             break;
//           case "clobber":
//           case "localize":
//             param = `${packagerSettings[key]}`;
//             break;
//           case "folder":
//           case "zipFile":
//             // Quotes to handle paths with spaces
//             param = `/${key}:${packagerSettings[key]}`;
//             break;
//           default:
//             param = `/${key}:${packagerSettings[key]}`;
//         }
//         if (isValid) {
//           parameters.push(param);
//         } else {
//           isValid = true;
//         }
//       }
//     }

//     return parameters;
//   }

//   static viewInExplorer(e: any, packagerSettings: any) {
//     let outputPath = `${
//       packagerSettings.zipFilePath
//     }\\${Helpers.splitZipFileString(packagerSettings.zipFile)}`;
//     let extractFolderPath = `${packagerSettings.folder}`;

//     // User input does not require .zip. Ensure it's added if not present to prevent failure.
//     if (Helpers.getFileExtension(packagerSettings.zipFile) === "") {
//       outputPath += ".zip";
//     }

//     electron.shell.showItemInFolder(
//       packagerSettings.action === "pack" ? outputPath : extractFolderPath
//     );
//   }
// }

// /*
//   Retrieve Settings
// */
// ipcMain.on("packagerPresets:retrieve", function(e: any) {
//   db.find({ presetName: { $exists: true } }, function(err: any, presets: any) {
//     win.webContents.send("packagerPresets:acquired", presets);
//   });
// });

// /*
//     Update Settings

//     Preset:
//     {
//       _id: string,
//       presetName: string,
//       action: string, // {"extract"|"pack"}
//       zipFile: string, // <file path>
//       zipFilePath: string,
//       folder: string, // <folder path>
//       packageType: string, // {"unmanaged"|"managed"|"both"}
//       allowWrite: string, // {"yes"|"no"}
//       allowDelete: string, // {"yes"|"no"|"prompt"}
//       clobber: string,
//       errorLevel: string, // {"yes"|"no"|"prompt"}
//       map: string, // <file path>
//       nologo: string,
//       log: string, // <file path>
//       sourceLoc: string, // <string>
//       localize: string
//     }
//   */
// ipcMain.on("packagerPresets:update", function(e: any, preset: any) {
//   db.update(
//     {
//       presetName: `${preset.presetName}`
//     },
//     {
//       $set: { ...preset }
//     },
//     {},
//     function(err: any, numReplaced: any) {
//       // Update callbackcode here
//       // db.find({ presetName: { $exists: true } }, function(
//       //   err,
//       //   presets
//       // ) {
//       //   win.webContents.send("packagerPresets:acquired", presets);
//       // });
//     }
//   );
// });

// ipcMain.on("packagerPresets:insert", function(e: any, preset: any) {
//   db.insert({ ...preset }, function(err: any, newDoc: any) {});
// });

// class SolutionPackagerError extends Error {
//   constructor(message?: string) {
//     super(message);
//     Object.setPrototypeOf(this, new.target.prototype);
//   }
// }

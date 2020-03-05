import Main from "./electron-main";
const electron = require("electron");
const { app, BrowserWindow } = electron;

Main.main(app, BrowserWindow);

// /// Solution Packager ///

// ipcMain.on(
//   "packager:retrieveDefaultExtract",
//   SolutionPackager.retrieveDefaultExtract
// );

// ipcMain.on("packager:execute", SolutionPackager.execute);

// ipcMain.on("viewInExplorer", SolutionPackager.viewInExplorer);

// /// Version Control ///

// ipcMain.on("versionControl:requestEntityData", VersionControl.retrieveData);

// /**
//  * Commit to git repository. Initializes if this is the first commit.
//  * To-Do: Have user init repo, then allow commit?
//  */
// ipcMain.on("git:commit", VersionControl.commit);

// ipcMain.on("git:init", VersionControl.init);

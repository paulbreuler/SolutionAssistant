export {};
const electron = require("electron");
const path = require("path");
const process = require("process");
export const log = require("electron-log");
export const { app, BrowserWindow, ipcMain } = electron;
export const isDev = require("electron-is-dev");
import SolutionPackager from "../src/electron-extensions/SolutionPackager";
import VersionControl from "../src/electron-extensions/VersionControl";

const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS
} = require("electron-devtools-installer");

export const Datastore = require("nedb"),
  db = new Datastore({
    filename: `${app.getPath("documents")}\\${
      app.name
    }\\datastore\\settings.store`,
    autoload: true
  });

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
//let win : BrowserWindow;
export let win: any;

function initializeApp() {
  if (isDev) {
    [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS].forEach(extension => {
      installExtension(extension)
        .then((name: any) => console.log(`Added Extension: ${name}`))
        .catch((err: any) => console.log("An error occurred: ", err));
    });
  }

  log.level = "verbose";
  // Create the browser window.
  win = new BrowserWindow({
    width: 1300,
    height: 850,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  //win.loadFile("public/index.html");
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  if (!isDev) {
    log.info(
      `Mode: Production. Loading application primary index.html from: file://${path.join(
        __dirname,
        "../build/index.html"
      )}`
    );
  } else {
    log.info("Mode: Development");
  }

  // create a new `splash`-Window
  let splash = new BrowserWindow({
    //minwidth: 950,
    width: 1300,
    //minheight: 600,
    height: 850,
    frame: false,
    alwaysOnTop: false
  });
  splash.loadURL(
    isDev
      ? "http://localhost:3000/splash.html"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // if main window is ready to show, then destroy the splash window and show up the main window
  win.once("ready-to-show", () => {
    splash.destroy();
    win.show();
  });

  // Open the DevTools.
  //win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
    app.quit();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", initializeApp);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    initializeApp();
  }
});

/// Solution Packager ///

ipcMain.on(
  "packager:retrieveDefaultExtract",
  SolutionPackager.retrieveDefaultExtract
);

ipcMain.on("packager:execute", SolutionPackager.execute);

ipcMain.on("viewInExplorer", SolutionPackager.viewInExplorer);

/// Version Control ///

ipcMain.on("versionControl:requestEntityData", VersionControl.retrieveData);

/**
 * Commit to git repository. Initializes if this is the first commit.
 * To-Do: Have user init repo, then allow commit?
 */
ipcMain.on("git:commit", VersionControl.commit);

ipcMain.on("git:init", VersionControl.init);

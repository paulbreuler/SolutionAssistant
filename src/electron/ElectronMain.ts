export {};
const path = require("path");
const process = require("process");
import ElectronLog from "electron-log";
export const isDev = require("electron-is-dev");
//import SolutionPackager from "../src/electron-extensions/SolutionPackager";
//import VersionControl from "../src/electron-extensions/VersionControl";
import DataStore from "nedb";
const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS
} = require("electron-devtools-installer");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
//let win : BrowserWindow;
//export let win: any;

export default class Main {
  static mainWindow: any;
  static application: any;
  static browserWindow: any;
  static DataStore: any;
  private static onWindowAllClosed() {
    if (process.platform !== "darwin") {
      Main.application.quit();
    }
  }

  private static onClose() {
    // Dereference the window object.
    Main.mainWindow.close();
  }

  // private static onReady() {
  //   Main.mainWindow = new Main.BrowserWindow({ width: 800, height: 600 });
  //   Main.mainWindow
  //     .loadURL('file://' + __dirname + '/index.html');
  //   Main.mainWindow.on('closed', Main.onClose);
  // }

  static onReady() {
    const Datastore = require("nedb"),
      db = new Datastore({
        filename: `${Main.application.getPath("documents")}\\${
          Main.application.name
        }\\datastore\\settings.store`,
        autoload: true
      });

    if (isDev) {
      [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS].forEach(extension => {
        installExtension(extension)
          .then((name: any) => console.log(`Added Extension: ${name}`))
          .catch((err: any) => console.log("An error occurred: ", err));
      });
    }

    // Create the browser window.
    Main.mainWindow = new Main.browserWindow({
      width: 1300,
      height: 850,
      show: false,
      webPreferences: {
        nodeIntegration: true
      }
    });

    // and load the index.html of the app.
    //win.loadFile("public/index.html");
    Main.mainWindow.loadURL(
      isDev
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "../build/index.html")}`
    );

    if (!isDev) {
      ElectronLog.info(
        `Mode: Production. Loading application primary index.html from: file://${path.join(
          __dirname,
          "../build/index.html"
        )}`
      );
    } else {
      ElectronLog.info("Mode: Development");
      ElectronLog.transports.file;
      ElectronLog.transports.file.level = "silly";
    }

    // create a new `splash`-Window
    let splash = new Main.browserWindow({
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
    Main.mainWindow.once("ready-to-show", () => {
      splash.destroy();
      Main.mainWindow.show();
    });

    // Open the DevTools.
    //win.webContents.openDevTools();

    // // Emitted when the window is closed.
    // Main.mainWindow.on("closed", () => {
    //   // Dereference the window object, usually you would store windows
    //   // in an array if your app supports multi windows, this is the time
    //   // when you should delete the corresponding element.
    //   // if (Main.mainWindow)
    //   //   Main.mainWindow.close();

    //   if (Main.application)
    //     Main.application.quit();
    // });
  }

  static main(app: any, browserWindow: any) {
    Main.browserWindow = browserWindow;
    Main.application = app;
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    Main.application.on("ready", Main.onReady);

    // Quit when all windows are closed.
    Main.application.on("window-all-closed", () => {
      // On macOS it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== "darwin") {
        Main.application.quit();
      }
    });

    Main.application.on("activate", () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (Main.mainWindow === null) {
        Main.onReady();
      }
    });
  }
}

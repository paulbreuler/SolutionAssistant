import Main from "../ElectronMain";
export class VersionControl {}
// import { win } from "../../public/electron";
// import log from "electron-log";
// import { SolutionParser } from "./SolutionParser";
// const simpleGit = require("simple-git");

// /// Version Control ///

// export default class VersionControl {
//   /**
//    * Initialize git repository
//    * @param {simpleGit} git
//    */
//   static initialiseRepo(git: any) {
//     return git.init().then(() => {});
//   }

//   static retrieveData(e: any, folderPath: string) {
//     SolutionParser.parseEntityData(log, win, folderPath);
//   }

//   static commit(e: any, summary: any, description: string, repoPath: string) {
//     log.info(`Commit Message: ${description}, Repo Path: ${repoPath}`);
//     simpleGit(repoPath).diffSummary(function(err: any, status: any) {
//       log.info(status.files[0]);
//     });

//     win.webContents.send("git:commit-completed", true);
//     /*
//         simpleGit()
//           .cwd(repoPath)
//           .add("./*")
//           .commit(`summary: ${summary}, desc: ${description}`, () => {
//             log.info(`Changes commited to repo: ${repoPath}`);
//           });
//           */
//   }

//   static init(e: any, repoPath: string) {
//     const gitP = require("simple-git/promise");
//     const git = gitP(repoPath);
//     git
//       .checkIsRepo()
//       .then((isRepo: any) => !isRepo && VersionControl.initialiseRepo(git))
//       .then(() => log.info(`Initialized repo for directory ${repoPath}`));
//   }
// }

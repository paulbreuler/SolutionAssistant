/**
 *  Parse CRM data from extracted/unpacked solution
 */

/** jshint {inline configuration here} */
const path = require("path");
const fs = require("fs");
const xml2js = require("xml2js");
const simpleGit = require("simple-git");
import { BrowserWindow } from "electron";
/**
 * Explores recursively a directory and returns all the filepaths and folderpaths in the callback.
 *
 * @see http://stackoverflow.com/a/5827895/4241030
 * @param {String} dir
 * @param {Function} done
 */
function filewalker(dir: any, done: any) {
  let results: any = [];

  fs.readdir(dir, function(err: any, list: any) {
    if (err) return done(err);

    var pending = list.length;

    if (!pending) return done(null, results);

    list.forEach(function(file: any) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err: any, stat: any) {
        // If directory, execute a recursive call
        if (stat && stat.isDirectory()) {
          // Add directory to array [comment if you need to remove the directories from the array]
          results.push(file);

          filewalker(file, function(err: any, res: any) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

/**
 * Parse Entity data from extracted CRM solution
 *
 * @param {electronLog}  log electron-log utility
 * @param {Electron.BrowserWindow}  win window to send ouput to
 * @param {String}  folderPath  path to extracted solution
 *
 * TODO: currently assumes "packagerSettings.folder" is correct path.
 * TODO: Setup repo reducer
 */
export module SolutionParser {
  export function parseEntityData(log: any, win: any, folderPath: any) {
    let entityFiles: any = [];
    let entityCollection = [];

    if (!fs.existsSync(folderPath)) {
      let message = "";
      if (folderPath === "") {
        message = `Error: directory not specified or state has been lost`;
        win.webContents.send("versionControl:EntityData", message, null);
        log.error(message);
      } else {
        message = `Error: directory does not exist: ${folderPath}`;
        win.webContents.send("versionControl:EntityData", message, null);
        log.error(message);
      }
    } else {
      simpleGit(folderPath).diffSummary(function(err: any, changes: any) {
        // Look at alternate to pre-filter
        // Ref: https://ourcodeworld.com/articles/read/420/how-to-read-recursively-a-directory-in-node-js
        filewalker(folderPath, (err: any, results: any) => {
          if (err) {
            log.error(err);
          } else {
            results.forEach((file: any) => {
              if (file.includes("Entity.xml")) {
                entityFiles.push(file);
              }
            });
          }

          var parser = new xml2js.Parser();
          entityFiles.forEach((file: any) => {
            log.info(`Reading entity data from file: ${file}`);
            // Read file
            fs.readFile(file, function(err: any, data: any) {
              if (err) {
                log.error(err);
              }
              /*
         
            */
              parseXml2js(
                parser,
                data,
                log,
                win,
                changes,
                (err: any, entity: any) => {
                  if (entity) {
                    entityCollection.push(entity);
                  }
                }
              );
            }); // ForEach file
          });
          // FileWalker
        }); // git diffsummary
      }); // else
    }
  }

  function checkForChanges(entityCollection: any) {
    simpleGit("").diffSummary(function(err: any, status: any) {
      console.log(status.files[0]);
    });
  }
}

/**
 * Deserialize file reader buffer into Entity class.
 *
 * @param {Parser}   parser xml2js parser
 * @param {Buffer}   data   buffer from file reader
 * @param {electronLog}   log  electron-log utility
 * @param {Electron.BrowserWindow} win  window to send ouput to
 * @param {callback} callback returns error and new entity instance (err, entity) => {}
 *
 */
function parseXml2js(
  parser: any,
  data: any,
  log: any,
  win: BrowserWindow,
  changes: any,
  callback: any
) {
  let entity = null;
  // Parse xml to JS Object
  parser.parseString(data, function(err: any, result: any) {
    if (err) {
      log.error(err);
      callback(err);
    }

    let fields: any = [];
    // Initialize entity
    entity = new Entity(result.Entity.Name[0].$.LocalizedName, fields);
    // Add iff entity has attributes
    if (result.Entity.EntityInfo[0].entity[0].attributes[0].attribute) {
      result.Entity.EntityInfo[0].entity[0].attributes[0].attribute.forEach(
        (attribute: any) => {
          fields.push({ physicalName: attribute.$.PhysicalName });
        }
      );

      entity.fields = fields;

      let filter = [];
      if (changes) {
        filter = changes.files.filter((change: any) => {
          let str = result.Entity.EntityInfo[0].entity[0].$.Name;
          let match = `Entities.*${str}.*Entity.xml`;
          return change.file.match(match);
        });

        if (filter.length > 0) {
          entity.isModified = true;
        }
      }
    }

    log.info(`Result: ${result}, Entity: ${entity}`);
    win.webContents.send("versionControl:EntityData", result, entity);
  });
}

/**
 * Represents CRM entity
 */
class Entity {
  name: string;
  fields: any;
  isModified: boolean;

  constructor(name: string, fields: any) {
    this.name = name;
    /**
     * CRM Attributes collection.
     * @type {Array}
     * @property {String} physicalName
     */
    this.fields = fields;
    /**
     * Modified in working branch
     * @type {Boolean}
     */
    this.isModified = false;
  }
}

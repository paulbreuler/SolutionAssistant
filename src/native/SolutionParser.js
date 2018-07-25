/**
 *  Parse CRM data from extracted/unpacked solution
 */

/** jshint {inline configuration here} */
const path = require("path");
const fs = require("fs");
const xml2js = require("xml2js");
const shell = require("node-powershell");
const simpleGit = require("simple-git");
/**
 * Explores recursively a directory and returns all the filepaths and folderpaths in the callback.
 *
 * @see http://stackoverflow.com/a/5827895/4241030
 * @param {String} dir
 * @param {Function} done
 */
function filewalker(dir, done) {
  let results = [];

  fs.readdir(dir, function(err, list) {
    if (err) return done(err);

    var pending = list.length;

    if (!pending) return done(null, results);

    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        // If directory, execute a recursive call
        if (stat && stat.isDirectory()) {
          // Add directory to array [comment if you need to remove the directories from the array]
          results.push(file);

          filewalker(file, function(err, res) {
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
module.exports.parseEntityData = (log, win, folderPath) => {
  let entityFiles = [];
  let entityCollection = [];

  if (!fs.existsSync(folderPath)) {
    win.webContents.send(
      "versionControl:EntityData",
      `Error: directory does not exist: ${folderPath}`
    );
  } else {
    simpleGit(folderPath).diffSummary(function(err, changes) {
      // Look at alternate to pre-filter
      // Ref: https://ourcodeworld.com/articles/read/420/how-to-read-recursively-a-directory-in-node-js
      filewalker(folderPath, (err, results) => {
        if (err) {
          log.error(err);
        } else {
          results.forEach(file => {
            if (file.includes("Entity.xml")) {
              entityFiles.push(file);
            }
          });
        }

        var parser = new xml2js.Parser();
        entityFiles.forEach(file => {
          log.info(`Reading entity data from file: ${file}`);

          // Read file
          fs.readFile(file, function(err, data) {
            if (err) {
              log.error(err);
            }
            /*
       
          */
            parseXml2js(parser, data, log, win, changes, (err, entity) => {
              if (entity) {
                entityCollection.push(entity);
              }
            });
          }); // ForEach file
        });
        // FileWalker
      }); // git diffsummary
    }); // else
  }
};

module.exports.checkForChanges = entityCollection => {
  simpleGit("").diffSummary(function(err, status) {
    console.log(status.files[0]);
  });
};

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
function parseXml2js(parser, data, log, win, changes, callback) {
  let entity = null;
  // Parse xml to JS Object
  parser.parseString(data, function(err, result) {
    if (err) {
      log.error(err);
      callback(err);
    }
    let fields = [];
    // Initialize entity
    entity = new Entity(result.Entity.Name[0].$.OriginalName, fields);
    // Add iff entity has attributes
    if (result.Entity.EntityInfo[0].entity[0].attributes[0].attribute) {
      result.Entity.EntityInfo[0].entity[0].attributes[0].attribute.forEach(
        attribute => {
          fields.push({ physicalName: attribute.$.PhysicalName });
        }
      );

      entity.fields = fields;

      let filter = changes.files.filter(change => {
        let str = result.Entity.EntityInfo[0].entity[0].$.Name;
        let match = `Entities.*${str}.*Entity.xml`;
        return change.file.match(match);
      });

      if (filter.length > 0) {
        entity.isModified = true;
      }
      win.webContents.send("versionControl:EntityData", result, entity);
    }
  });
}

/**
 * Represents CRM entity
 */
class Entity {
  constructor(name, fields) {
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

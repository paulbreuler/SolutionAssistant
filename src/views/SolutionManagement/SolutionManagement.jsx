import PropTypes from "prop-types";
import React from "react";
import { Grid } from "@material-ui/core";
import {
  RegularCard,
  Button,
  CustomInput,
  ItemGrid,
  NotificationManager,
  FolderInput
} from "components";
import { connect } from "react-redux";
import {
  addNotification,
  removeNotification,
  updatePackagerSetting,
  updatePackagerPreset,
  updateAllPackagerSettings
} from "../../redux";
import SolutionManagerTabs from "./SolutionManagerTabs";
import { AddAlert } from "@material-ui/icons";

const constants = require("../../assets/Strings.js");

const electron = window.require("electron");
const ipcRenderer = electron.ipcRenderer;
const { dialog } = electron.remote;

class SolutionManagement extends React.Component {
  constructor(props) {
    super(props);
    this.handleError = this.handleError.bind(this);
    this.showNotification = this.showNotification.bind(this);
    this.splitZipFileString = this.splitZipFileString.bind(this);
    this.handlePackagerOutput = this.handlePackagerOutput.bind(this);
  }

  state = {
    solutionFile: "",
    count: 0,
    isPacking: false,
    packageFolder: false,
    loadedFromDB: false
  };

  componentDidMount() {
    ipcRenderer.on("packager:output", (event, type, output) => {
      this.handlePackagerOutput(event, type, output);
    });

    ipcRenderer.on("packagerPresets:acquired", (event, presets) => {
      if (presets.length === 0) {
        ipcRenderer.send("packager:retrieveDefaultExtract");
      } else {
        presets.forEach(preset => {
          this.props.onUpdatePackagerPreset(preset);
          if (preset.presetName === "Default") {
            const { _id, ...presetToUpdate } = preset;
            this.props.onUpdateAllPackagerSettings(presetToUpdate);
            this.setState({ loadedFromDB: true });
          }
        });
      }
    });

    // Only grab default settings if a preset is not already defined.
    if (this.props.packagerSettings.presetName === "") {
      ipcRenderer.send("packagerPresets:retrieve");
    }
  }

  componentDidUpdate(nextProps) {
    // Check if packagersettings props have updated.
    const { packagerSettings } = this.props;
    if (nextProps.packagerSettings !== packagerSettings) {
      if (packagerSettings) {
        this.setState({ packageFolder: false });
      }
    }
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners("packager:output");
    ipcRenderer.removeAllListeners("packagerPresets:acquired");
  }

  handlePackagerOutput(event, type, output) {
    switch (type) {
      case "success":
        this.showNotification({
          message: "Solution extracted successfully",
          color: "success",
          icon: AddAlert
        });
        break;
      case "error":
        this.showNotification({
          message: `Error: ${output} \nPlease check log file located at %appdata%\\solution-assistant for more info. `,
          color: "danger",
          icon: AddAlert
        });
        break;
      default:
        this.showNotification({
          message: `Solution failed to extract! Please check log file located at %appdata%\\solution-assistant`,
          color: "danger",
          icon: AddAlert
        });
        break;
    }

    this.setState({
      isPacking: false,
      packageFolder: type === "success" ? true : false
    });
  }

  handleError(err) {
    console.log(err);
  }

  handleChange = event => {
    this.props.onUpdatePackagerSetting({
      [event.target.name]: event.target.value
    });
  };

  browseForSolutionFile(e) {
    let options = {
      title: "Locate PowerApps Solution Zip",
      properties: ["openfile"],
      filters: [
        { name: "Zip", extensions: ["zip"] },
        { name: "All Files", extensions: ["*"] }
      ]
    };

    let fileNames = dialog.showOpenDialogSync(options);

    // fileNames is an array that contains all the selected
    if (fileNames === undefined) {
      if (!this.props.packagerSettings.zipFile) {
        this.showNotification({
          message: "No file selected!",
          color: "warning",
          icon: AddAlert
        });
      }
      return;
    } else {
      this.setState({ solutionFile: fileNames[0] });
      this.props.onUpdatePackagerSetting({
        zipFile: fileNames[0]
      });
    }
  }

  handleSolutionPackaging() {
    let isValid = true;
    let settings = this.props.packagerSettings;
    if (settings.action === constants.EXTRACT) {
      if (!settings.zipFile) {
        this.showNotification({
          message: "No Solution Package selected!",
          color: "warning",
          icon: AddAlert
        });
        isValid = false;
      }
      if (!settings.folder) {
        console.log("No folder for output!");
        isValid = false;
      }
    }

    if (settings.action === constants.PACK) {
      if (!settings.zipFile) {
        this.showNotification({
          message: "Please provide a solution file name",
          color: "warning",
          icon: AddAlert
        });
        isValid = false;
      }
      if (!settings.zipFilePath) {
        this.showNotification({
          message: "Please provide a value for Output Folder",
          color: "warning",
          icon: AddAlert
        });
        isValid = false;
      }
    }
    if (isValid) {
      ipcRenderer.send("packager:execute", this.props.packagerSettings);
      this.setState({ isPacking: true });
    }
  }

  splitZipFileString(str) {
    let path = str.substring(0, str.lastIndexOf("\\"));
    let file = this.props.packagerSettings.zipFile.split("\\").pop();
    return { path, file };
  }

  getFileExtension(filename) {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  }

  showInFileExplorer() {
    ipcRenderer.send("viewInExplorer", this.props.packagerSettings);
  }

  showNotification = notification => {
    this.props.onAddNotification({
      id: Date.now(),
      message: notification.message,
      open: true,
      color: notification.color,
      icon: notification.icon
    });
  };

  render() {
    let { packageFolder } = this.state;
    return (
      <div>
        <Grid container>
          <ItemGrid xs={12} sm={12} md={6}>
            <RegularCard
              cardTitle="Solution"
              cardSubtitle={
                this.props.packagerSettings.action === constants.EXTRACT
                  ? "Browse for an existing solution to begin"
                  : "Enter output path and the desired solution zip name"
              }
              content={
                <div>
                  {this.props.packagerSettings.action === constants.PACK && (
                    <ItemGrid xs={12} sm={12}>
                      <FolderInput
                        labelText="Output Folder"
                        name="zipFilePath"
                        handleStateLift={this.handleChange}
                        folder={this.props.packagerSettings.zipFilePath}
                        error={false}
                      />
                    </ItemGrid>
                  )}

                  <ItemGrid xs={12} sm={12}>
                    <CustomInput
                      labelText="Solution"
                      id="solution"
                      handleStateLift={this.handleChange}
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        value: this.splitZipFileString(
                          this.props.packagerSettings.zipFile
                        ).file,
                        disabled:
                          this.props.packagerSettings.action ===
                            constants.EXTRACT ||
                          this.props.packagerSettings.action === "",
                        name: "zipFile"
                      }}
                    />
                  </ItemGrid>
                </div>
              }
              footer={
                <React.Fragment>
                  <Grid container>
                    {(this.props.packagerSettings.action ===
                      constants.EXTRACT ||
                      this.props.packagerSettings.action === "") && (
                      <ItemGrid xs={6}>
                        <Button
                          color="white"
                          onClick={this.browseForSolutionFile.bind(this)}
                          fullWidth
                        >
                          Browse
                        </Button>
                      </ItemGrid>
                    )}
                    {this.props.packagerSettings.action !== "" && (
                      <ItemGrid xs={6}>
                        <Button
                          color="primary"
                          onClick={this.handleSolutionPackaging.bind(this)}
                          disabled={
                            (this.props.packagerSettings.zipFile.length === 0 &&
                              this.props.packagerSettings.action ===
                                constants.EXTRACT) ||
                            this.state.isPacking
                          }
                          fullWidth
                        >
                          {this.props.packagerSettings.action === "extract"
                            ? "Extract "
                            : "Pack "}
                          Solution
                        </Button>
                      </ItemGrid>
                    )}
                    {packageFolder && (
                      <ItemGrid xs={12}>
                        <Button
                          color="rose"
                          onClick={this.showInFileExplorer.bind(this)}
                          fullWidth
                        >
                          View in File Explorer
                        </Button>
                      </ItemGrid>
                    )}
                  </Grid>
                </React.Fragment>
              }
            />
          </ItemGrid>
          <ItemGrid xs={12} sm={12} md={12}>
            <SolutionManagerTabs
              packagerSettings={this.props.packagerSettings}
              onUpdatePackagerSetting={this.props.onUpdatePackagerSetting}
              packagerPresets={this.props.packagerPresets}
              onUpdatePackagerPreset={this.props.onUpdatePackagerPreset}
              loadedFromDB={this.state.loadedFromDB}
            />
          </ItemGrid>
          <NotificationManager />
        </Grid>
      </div>
    );
  }
}

SolutionManagement.propTypes = {
  onUpdatePackagerSetting: PropTypes.func.isRequired,
  onUpdateAllPackagerSettings: PropTypes.func.isRequired,
  onUpdatePackagerPreset: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  packagerSettings: state.packagerSettings.current,
  packagerPresets: state.packagerSettings.presets
});

const mapActionsToProps = {
  onUpdatePackagerSetting: updatePackagerSetting,
  onUpdateAllPackagerSettings: updateAllPackagerSettings,
  onUpdatePackagerPreset: updatePackagerPreset,
  onAddNotification: addNotification,
  onRemoveNotification: removeNotification
};

export default connect(mapStateToProps, mapActionsToProps)(SolutionManagement);

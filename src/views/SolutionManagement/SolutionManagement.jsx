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
    packageFolder: "",
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
    ipcRenderer.send("packagerPresets:retrieve");
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners("packager:output");
    ipcRenderer.removeAllListeners("packagerPresets:acquired");
  }

  handlePackagerOutput(event, type, output) {
    if (type === "success") {
      this.showNotification({
        message: "Solution extracted successfully",
        color: "success",
        icon: AddAlert
      });
    } else {
      this.showNotification({
        message: `Solution failed to extract! please check log file located at %appdata%\\dynamics-solution-assistant`,
        color: "danger",
        icon: AddAlert
      });
    }
    this.setState({
      isPacking: false,
      packageFolder:
        type === "success" ? this.props.packagerSettings.folder : ""
    });
    this.handleError(event);
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
    dialog.showOpenDialog(fileNames => {
      // fileNames is an array that contains all the selected
      if (fileNames === undefined) {
        this.showNotification({
          message: "No file selected!",
          color: "warning",
          icon: AddAlert
        });
        return;
      } else {
        console.log(fileNames[0]);
        this.setState({ solutionFile: fileNames[0] });
        this.props.onUpdatePackagerSetting({
          zipFile: fileNames[0]
        });
      }
    });
  }

  browseForOutputDirectory(e) {
    dialog.showOpenDialog({ properties: ["openDirectory"] }, directory => {
      // fileNames is an array that contains all the selected
      if (directory === undefined) {
        this.showNotification({
          message: "No directory selected!",
          color: "warning",
          icon: AddAlert
        });
        return;
      } else {
        console.log(directory[0]);
        this.setState({ solutionFile: directory[0] });
        this.props.onUpdatePackagerSetting({
          zipFile: directory[0]
        });
      }
    });
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
    }
    if (isValid) {
      ipcRenderer.send("packager", this.props.packagerSettings);
      this.setState({ isPacking: true });
    }
  }

  splitZipFileString(str) {
    let path = str.substring(0, str.lastIndexOf("\\"));
    let file = this.props.packagerSettings.zipFile.split("\\").pop();
    return { path, file };
  }

  showInFileExplorer() {
    electron.shell.showItemInFolder(this.state.packageFolder);
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
                    {this.state.packageFolder && (
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

export default connect(
  mapStateToProps,
  mapActionsToProps
)(SolutionManagement);

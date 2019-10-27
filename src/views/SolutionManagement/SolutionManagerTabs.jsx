import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import { Grid } from "@material-ui/core";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@material-ui/core";

import {
  Button,
  CustomInput,
  ItemGrid,
  CustomSelect,
  FolderInput
} from "components";

const electron = window.require("electron");
const ipcRenderer = electron.ipcRenderer;
const constants = require("../../assets/Strings.js");

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
};

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
  },
  spacer: {
    margin: "27px 0 0 0"
  }
});

// Allow dynamics tab building.
// Example Usage
/*
    <TabsWrappedLabel
              tabs={[
                {
                  id: 1,
                  title: "General",
                  content: "General Tab!"
                },
                {
                  id: 2,
                  title: "Packager Settings",
                  content: SettingsTab(this.props) // This is a functional component. Passing props to allow for state lifting
                }
              ]}
            />
*/
class SolutionManagerTabs extends React.Component {
  constructor(props) {
    super(props);
    this.updateState = this.updateState.bind(this);
    this.validate = this.validate.bind(this);
    this.resetForm = this.resetForm.bind(this);

    this.state = {
      tabValue: 1,
      presetName: props.packagerSettings.presetName,
      action: props.packagerSettings.action, // {Extract|Pack}
      zipFile: props.packagerSettings.zipFile, // <file path>
      folder: props.packagerSettings.folder, // <folder path>
      packageType: props.packagerSettings.packageType, // {Unmanaged|Managed|Both}
      allowWrite: props.packagerSettings.allowWrite, // {Yes|No}
      allowDelete: props.packagerSettings.allowDelete, // {Yes|No|Prompt}
      clobber: props.packagerSettings.clobber,
      errorLevel: props.packagerSettings.errorLevel, // {Yes|No|Prompt}
      map: props.packagerSettings.map, // <file path>
      nologo: props.packagerSettings.nologo,
      log: props.packagerSettings.log, // <file path>
      sourceLoc: props.packagerSettings.sourceLoc, // <string>
      localize: props.packagerSettings.localize,
      invalidInput: false,
      isDirty: false,
      dialogOpen: false,
      newPresetName: ""
    };
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.loadedFromDB !== this.props.loadedFromDB &&
      this.props.loadedFromDB
    ) {
      this.applySavedSettings(this.props.packagerSettings);
    }
  }

  /**
   * @description Clears unsaved changes
   */
  resetForm = () => {
    this.setState(this.props.packagerSettings);
  };

  applySavedSettings = packagerSettings => {
    let e;
    let event = {
      target: {
        name: "",
        value: ""
      }
    };
    for (e in packagerSettings) {
      event.target.value = packagerSettings[e];
      event.target.name = [e];
      this.updateState(event);
    }
  };

  makeRelevantPreset = fullState => {
    const {
      tabValue,
      invalidInput,
      isDirty,
      dialogOpen,
      newPresetName,
      ...relevantPreset
    } = fullState;
    return relevantPreset;
  };

  saveCurrentPreset = () => {
    this.props.onUpdatePackagerPreset(this.makeRelevantPreset(this.state));
  };

  isDifferentFromState = preset => {
    if (!preset) return;
    const relevantState = this.makeRelevantPreset(this.state);
    for (let key in relevantState) {
      if (relevantState.hasOwnProperty(key)) {
        if (relevantState[key] !== preset[key]) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * Packager settings state update
   */
  updateState = event => {
    let isDirty = false;
    if (event.type) {
      isDirty = this.isDifferentFromState(
        this.props.packagerPresets[this.state.presetName]
      );
      if (
        this.props.packagerPresets &&
        event.target.value !==
          this.props.packagerPresets[this.state.presetName][event.target.name]
      ) {
        isDirty = true;
      }
    }

    this.setState({
      [event.target.name]: event.target.value,
      isDirty
    });

    this.props.onUpdatePackagerSetting({
      [event.target.name]: event.target.value
    });
  };

  updateNewPresetName = event => {
    this.setState({
      newPresetName: event.target.value
    });
  };

  handlePresetChange = event => {
    this.applySavedSettings(this.props.packagerPresets[event.target.value]);
    this.setState({
      presetName: event.target.value
    });
  };

  openNewPresetDialog = () => {
    this.setState({
      dialogOpen: true
    });
  };

  closeNewPresetDialog = () => {
    this.setState({
      dialogOpen: false
    });
  };

  saveNewPreset = () => {
    const newPreset = this.makeRelevantPreset(this.state); // mark current
    newPreset.presetName = this.state.newPresetName;
    this.props.onUpdatePackagerPreset(newPreset);
    this.applySavedSettings(newPreset);
    this.setState({ dialogOpen: false, newPresetName: "" });
  };

  handleTabChange = (event, tabValue) => {
    this.setState({ tabValue });
  };

  buildTabContent(props) {}

  validate() {
    // true means invalid, so our conditions got reversed
    return {
      folder: this.state.folder.length === 0
      //password: folder.length === 0
    };
  }

  render() {
    const { classes } = this.props;
    const { tabValue } = this.state;

    //store errors for all fields
    const errors = this.validate();
    // Determine if error should be shown
    const shouldMarkError = field => {
      const hasError = errors[field];
      //const shouldShow = this.state.touched[field];
      return hasError ? true : false;
    };

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs value={tabValue} onChange={this.handleTabChange}>
            <Tab key={1} value={1} label="Packager Settings" />
            {/* <Tab key={2} value={2} label="Test Tab" /> */}
          </Tabs>
        </AppBar>
        {tabValue === 1 && (
          <TabContainer key={1}>
            <Grid container>
              <ItemGrid xs={4}>
                <CustomSelect
                  value={this.state.presetName}
                  labelText="Preset"
                  inputProps={{
                    id: "preset-select",
                    name: "preset"
                  }}
                  labelProps={{
                    required: true
                  }}
                  handleStateLift={this.handlePresetChange}
                  formControlProps={{
                    fullWidth: true
                  }}
                  menuItems={Object.keys(this.props.packagerPresets).map(
                    presetName => ({
                      value: `${presetName}`,
                      text: `${presetName}`
                    })
                  )}
                />
              </ItemGrid>
              <ItemGrid xs={4}>
                <Button
                  color="white"
                  onClick={this.saveCurrentPreset}
                  disabled={!this.state.isDirty}
                  spacer={true}
                  fullWidth
                >
                  Save Preset
                </Button>
              </ItemGrid>
              <ItemGrid xs={4}>
                <Button
                  color="info"
                  onClick={this.openNewPresetDialog}
                  spacer={true}
                  fullWidth
                >
                  Save New Preset
                </Button>
              </ItemGrid>
              <ItemGrid xs={12} sm={12} md={2}>
                <CustomSelect
                  value={this.state.action}
                  labelText="Action"
                  inputProps={{
                    id: "action-select",
                    name: "action"
                  }}
                  labelProps={{
                    required: true
                  }}
                  handleStateLift={this.updateState}
                  formControlProps={{
                    fullWidth: true
                  }}
                  menuItems={[
                    { value: "", text: "" },
                    { value: constants.EXTRACT, text: "Extract" },
                    { value: constants.PACK, text: "Pack" }
                  ]}
                />
              </ItemGrid>
              <ItemGrid xs={12} sm={12} md={2}>
                <CustomSelect
                  value={this.state.packageType}
                  labelText="Package Type"
                  inputProps={{
                    id: "packageType-select",
                    name: "packageType"
                  }}
                  handleStateLift={this.updateState}
                  formControlProps={{
                    fullWidth: true
                  }}
                  menuItems={[
                    { value: "", text: "" },
                    { value: "unmanaged", text: "Unmanaged" },
                    { value: "managed", text: "Managed" },
                    { value: "both", text: "Both" }
                  ]}
                />
              </ItemGrid>
              <ItemGrid xs={12} sm={12} md={2}>
                <CustomSelect
                  value={this.state.allowWrite}
                  labelText="Allow Write"
                  inputProps={{
                    id: "allowWrite-select",
                    name: "allowWrite"
                  }}
                  handleStateLift={this.updateState}
                  formControlProps={{
                    fullWidth: true
                  }}
                  menuItems={[
                    { value: "", text: "" },
                    { value: "yes", text: "Yes" },
                    { value: "no", text: "No" }
                  ]}
                />
              </ItemGrid>
              <ItemGrid xs={12} sm={12} md={2}>
                <CustomSelect
                  value={this.state.allowDelete}
                  labelText="Allow Delete"
                  inputProps={{
                    id: "allowDelete-select",
                    name: "allowDelete"
                  }}
                  handleStateLift={this.updateState}
                  formControlProps={{
                    fullWidth: true
                  }}
                  menuItems={[
                    { value: "", text: "" },
                    { value: "yes", text: "Yes" },
                    { value: "no", text: "No" },
                    { value: "prompt", text: "Prompt" }
                  ]}
                />
              </ItemGrid>
              <ItemGrid xs={12} sm={12} md={2}>
                <CustomSelect
                  value={this.state.clobber}
                  labelText="Clobber"
                  inputProps={{
                    id: "clobber-select",
                    name: "clobber"
                  }}
                  handleStateLift={this.updateState}
                  formControlProps={{
                    fullWidth: true
                  }}
                  menuItems={[
                    { value: "", text: "" },
                    { value: "/clobber", text: "Yes" }
                  ]}
                />
              </ItemGrid>
              <ItemGrid xs={12} sm={12} md={2}>
                <CustomSelect
                  value={this.state.errorLevel}
                  labelText="Error Level"
                  inputProps={{
                    id: "errorLevel-select",
                    name: "errorLevel"
                  }}
                  handleStateLift={this.updateState}
                  formControlProps={{
                    fullWidth: true
                  }}
                  menuItems={[
                    { value: "", text: "" },
                    { value: "off", text: "Off" },
                    { value: "error", text: "Error" },
                    { value: "warning", text: "Warning" },
                    { value: "info", text: "Info" },
                    { value: "verbose", text: "Verbose" }
                  ]}
                />
              </ItemGrid>
              <ItemGrid xs={12} sm={12} md={6}>
                <FolderInput
                  name="folder"
                  handleStateLift={this.updateState}
                  folder={this.state.folder}
                  error={shouldMarkError("folder")}
                />
              </ItemGrid>
              <ItemGrid xs={12} sm={12} md={6}>
                <CustomInput
                  value={this.state.map}
                  labelText="Map"
                  id="map-input"
                  handleStateLift={this.updateState}
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    name: "map"
                  }}
                />
              </ItemGrid>
              <ItemGrid xs={12} sm={12} md={6}>
                <CustomInput
                  value={this.state.log}
                  labelText="Log"
                  id="log-input"
                  handleStateLift={this.updateState}
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    name: "log"
                  }}
                />
              </ItemGrid>
              <ItemGrid xs={12} sm={12} md={4}>
                <CustomInput
                  value={this.state.sourceLoc}
                  labelText="SourceLoc"
                  id="sourceLoc-input"
                  handleStateLift={this.updateState}
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    name: "sourceLoc"
                  }}
                />
              </ItemGrid>
              <ItemGrid xs={12} sm={12} md={2}>
                <CustomSelect
                  value={this.state.localize}
                  labelText="Localize"
                  inputProps={{
                    id: "localize-select",
                    name: "localize"
                  }}
                  handleStateLift={this.updateState}
                  formControlProps={{
                    fullWidth: true
                  }}
                  menuItems={[
                    { value: "", text: "" },
                    { value: "/localize", text: "Yes" }
                  ]}
                />
              </ItemGrid>
            </Grid>
            <Dialog
              open={this.state.dialogOpen}
              onClose={this.closeNewPresetDialog}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle id="form-dialog-title">Save New Preset</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Make a name for the new preset
                </DialogContentText>
                <CustomInput
                  value={this.state.newPresetName}
                  labelText="Preset Name"
                  id="new-preset-name"
                  handleStateLift={this.updateNewPresetName}
                  formControlProps={{
                    fullWidth: true,
                    autoFocus: true
                  }}
                  inputProps={{
                    name: "newPresetName"
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={this.closeNewPresetDialog} color="white">
                  Cancel
                </Button>
                <Button
                  onClick={this.saveNewPreset}
                  color="primary"
                  disabled={this.state.newPresetName === ""}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          </TabContainer>
        )}
        {tabValue === 2 && (
          <TabContainer key={2}>
            <Grid container>
              <ItemGrid xs={12} sm={12} md={2} />
            </Grid>
          </TabContainer>
        )}
      </div>
    );
  }
}

SolutionManagerTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  loadedFromDB: PropTypes.bool
};

export default withStyles(styles)(SolutionManagerTabs);

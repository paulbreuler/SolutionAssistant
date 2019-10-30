import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { compose } from "recompose";
import { withStyles, Paper, TextField } from "@material-ui/core";
import { AddAlert } from "@material-ui/icons";
import TreeView from "react-treeview";
import SplitPane from "react-split-pane";
import { addNotification, removeNotification } from "../../redux";
import { Grid } from "@material-ui/core";
import { ItemGrid, Button, NotificationManager } from "components";

import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";

import "../../assets/css/tree-view-styles.css";
import "../../assets/css/split-pane.css";

import update from "immutability-helper";
const electron = window.require("electron");
const ipcRenderer = electron.ipcRenderer;

const styles = {
  historyPanel: {
    overflow: "auto",
    position: "relative",
    float: "right",
    maxHeight: "100%",
    width: "100%",
    overflowScrolling: "touch"
  }
};

class VersionControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ps: "",
      dataSource: [
        {
          type: "Entities",
          collapsed: true,
          entities: []
        }
      ],
      summary: "",
      description: "",
      mainPanelContent: ""
    };

    this.addEntity = this.addEntity.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.showNotification = this.showNotification.bind(this);
    this.handleEntityClick = this.handleEntityClick.bind(this);
  }
  componentDidMount() {
    if (navigator.platform.indexOf("Win") > -1) {
      const scrollbar = new PerfectScrollbar(this.refs.historyPanel);
      this.setState({ ps: scrollbar });
    }

    // Adds individual entity
    ipcRenderer.on("versionControl:EntityData", (event, raw, entity) => {
      if (!entity) {
        this.showNotification({
          message: `${raw}. Please check log file located at %appdata%\\dynamics-solution-assistant`,
          color: "danger",
          icon: AddAlert
        });
      } else {
        this.addEntity(entity);
      }
    });

    ipcRenderer.on("git:commit-completed", response => {
      if (response)
        this.showNotification({
          message: "Commit Complete",
          color: "success",
          icon: AddAlert
        });
    });

    // Request entity data from repo
    ipcRenderer.send(
      "versionControl:requestEntityData",
      this.props.packagerSettings.current.folder
    );
  }

  componentDidUpdate() {
    this.refs.historyPanel.scrollTop = 0;
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners("git:commit");
    ipcRenderer.removeAllListeners("versionControl:requestEntityData");
    ipcRenderer.removeAllListeners("git:commit-completed");
  }

  addEntity(entity) {
    let newState = update(this.state, {
      dataSource: [
        {
          entities: { $push: [entity] }
        }
      ]
    });
    this.setState({
      dataSource: newState.dataSource
    });
    this.state.ps.update();
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  showNotification = notification => {
    this.props.onAddNotification({
      id: Date.now(),
      message: notification.message,
      open: true,
      color: notification.color,
      icon: notification.icon
    });
  };

  handleEntityClick = entity => {
    console.log("clicked");
    this.setState({
      mainPanelContent: `${entity.name} xml content...`
    });
  };

  render() {
    return (
      <React.Fragment>
        <Paper>
          <SplitPane
            style={{
              display: "flex",
              flex: 1,
              height: "100%",
              minHeight: "625px",
              position: "relative",
              outline: "none",
              overflow: "hidden",
              MozUserSelect: "text",
              WebkitUserSelect: "text",
              msUserSelect: "text",
              userSelect: "text"
            }}
            split="vertical"
            minSize={225} // width
            defaultSize={265} // width
            paneStyle={this.props.classes.relative}
          >
            <SplitPane
              split="horizontal"
              minSize={400}
              defaultSize={450} // height
              pane1Style={{
                flex: "0 0 auto",
                position: "relative",
                outline: "none",
                height: "100px",
                display: "flex",
                overflow: "hidden"
              }}
            >
              <div
                className={this.props.classes.historyPanel}
                ref="historyPanel"
              >
                {this.state.dataSource.map((node, i) => {
                  const type = node.type;
                  const label = <span className="node">{type}</span>;
                  return (
                    <TreeView
                      key={type + "|" + i}
                      nodeLabel={label}
                      defaultCollapsed={false}
                    >
                      {node.entities.map(entity => {
                        if (!entity) {
                          return <div> Error parsing entity </div>;
                        }
                        let label2 = "";
                        if (entity.isModified) {
                          label2 = (
                            <span
                              className="node"
                              style={{ color: "red" }}
                              onClick={() => {
                                this.handleEntityClick(entity);
                              }}
                            >
                              {entity.name}
                            </span> // Header
                          );
                        } else {
                          label2 = (
                            <span
                              className="node"
                              onClick={() => {
                                this.handleEntityClick(entity);
                              }}
                            >
                              {entity.name}
                            </span> // Header
                          );
                        }
                        const label3 = (
                          <span className="node">{"Fields"}</span> // Header 1
                        );
                        return (
                          <TreeView
                            key={entity.name}
                            nodeLabel={label2}
                            defaultCollapsed={true}
                          >
                            <TreeView
                              nodeLabel={label3}
                              key={entity.name + "_fields"}
                              defaultCollapsed={true}
                            >
                              {entity.fields.map(field => {
                                return (
                                  <div className="info">
                                    {field.physicalName}
                                  </div>
                                );
                              })}
                            </TreeView>
                          </TreeView>
                        );
                      })}
                    </TreeView>
                  );
                })}
              </div>
              <div style={{ backgroundColor: "#F5F5F5", height: "100%" }}>
                <Grid container>
                  <ItemGrid xs={12} sm={12} md={12}>
                    <TextField
                      value={this.state.description}
                      onChange={this.handleChange}
                      disabled={true}
                      placeholder="Commits are not allowed. Version Control is in preview mode"
                      name="description"
                      id="description-input"
                      multiline={true}
                      rows={4}
                      rowsMax={4}
                      fullWidth
                    />
                  </ItemGrid>
                  <ItemGrid xs={12} sm={12} md={12}>
                    <Button
                      color="primary"
                      disabled={true}
                      onClick={() => {
                        if (this.state.description === "") {
                          this.showNotification({
                            message: "Missing commit message",
                            color: "danger",
                            icon: AddAlert
                          });
                        } else {
                          ipcRenderer.send(
                            "git:commit",
                            this.state.description,
                            this.props.packagerSettings.folder
                          );
                        }
                      }}
                      fullWidth
                    >
                      Commit to Master
                    </Button>
                  </ItemGrid>
                </Grid>
              </div>
            </SplitPane>
            <div>
              <div className="pane-content">{this.state.mainPanelContent}</div>
            </div>
          </SplitPane>
        </Paper>
        <NotificationManager maxNotificationToDisplay={5} />
      </React.Fragment>
    );
  }
}

// VersionControl.propTypes = {
//   onUpdatePackagerSetting: PropTypes.func.isRequired
// };

const mapStateToProps = state => ({
  packagerSettings: state.packagerSettings
});

const mapActionsToProps = {
  onAddNotification: addNotification,
  onRemoveNotification: removeNotification
};

export default compose(
  connect(
    mapStateToProps,
    mapActionsToProps
  ),
  withStyles(styles)
)(VersionControl);

/*
Summary field
<TextField
  value={this.state.summary}
  onChange={this.handleChange}
  name="summary"
  placeholder="Summary (required)"
  id="summary-input"
  required
  fullWidth
/>
*/

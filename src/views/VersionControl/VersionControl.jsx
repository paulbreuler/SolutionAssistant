import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { compose } from "recompose";
import { withStyles, Paper, TextField } from "@material-ui/core";
import TreeView from "react-treeview";
import SplitPane from "react-split-pane";
import { addNotification, removeNotification } from "../../redux";
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";

import "../../assets/css/tree-view-styles.css";
import "../../assets/css/split-pane.css";

// This example data format is totally arbitrary. No data massaging is
// required and you use regular js in `render` to iterate through and
// construct your nodes.
const dataSource = [
  {
    type: "Entities",
    collapsed: false,
    entities: [
      {
        name: "Announcement",
        fields: [{ name: "subject" }],
        collapsed: false
      },
      {
        name: "Test Entity",
        fields: [{ name: "subject" }],
        collapsed: false
      }
    ]
  }
];

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
  componentDidMount() {
    if (navigator.platform.indexOf("Win") > -1) {
      // eslint-disable-next-line
      const ps = new PerfectScrollbar(this.refs.historyPanel);
    }
  }

  componentDidUpdate() {
    this.refs.historyPanel.scrollTop = 0;
  }
  render() {
    return (
      <Paper>
        <SplitPane
          style={{
            display: "flex",
            flex: 1,
            height: "100%",
            minHeight: "600px",
            position: "relative",
            outline: "none",
            overflow: "hidden",
            MozUserSelect: "text",
            WebkitUserSelect: "text",
            msUserSelect: "text",
            userSelect: "text"
          }}
          split="vertical"
          minSize={150} // width
          defaultSize={200} // width
          paneStyle={this.props.classes.relative}
        >
          <SplitPane
            split="horizontal"
            minSize={450} // height
            pane1Style={{
              flex: "0 0 auto",
              position: "relative",
              outline: "none",
              height: "100px",
              display: "flex",
              overflow: "hidden"
            }}
          >
            <div className={this.props.classes.historyPanel} ref="historyPanel">
              {dataSource.map((node, i) => {
                const type = node.type;
                const label = <span className="node">{type}</span>;
                return (
                  <TreeView
                    key={type + "|" + i}
                    nodeLabel={label}
                    defaultCollapsed={false}
                  >
                    {node.entities.map(entity => {
                      const label2 = (
                        <span className="node">{entity.name}</span> // Header
                      );
                      const label3 = (
                        <span className="node">{"Fields"}</span> // Header 1
                      );
                      return (
                        <TreeView
                          key={entity.name}
                          nodeLabel={label2}
                          defaultCollapsed={false}
                        >
                          <TreeView
                            nodeLabel={label3}
                            key={entity.name + "_fields"}
                            defaultCollapsed={false}
                          >
                            {entity.fields.map(field => {
                              return <div className="info">{field.name}</div>;
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
              Test
            </div>
          </SplitPane>
          <div>
            <div className="pane-content"> Second Pane </div>
          </div>
        </SplitPane>
      </Paper>
    );
  }
}

VersionControl.propTypes = {
  onUpdatePackagerSetting: PropTypes.func.isRequired
};

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

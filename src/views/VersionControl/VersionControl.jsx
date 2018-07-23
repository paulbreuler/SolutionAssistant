import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { compose } from "recompose";
import { withStyles } from "@material-ui/core";
import { addNotification, removeNotification } from "../../redux";
import TreeView from "react-treeview";

import "../../assets/css/tree-view-styles.css";

const styles = {};

// This example data format is totally arbitrary. No data massaging is
// required and you use regular js in `render` to iterate through and
// construct your nodes.
const dataSource = [
  {
    type: "Employees",
    collapsed: false,
    people: [
      {
        name: "Paul Gordon",
        age: 29,
        sex: "male",
        role: "coder",
        collapsed: false
      },
      {
        name: "Sarah Lee",
        age: 27,
        sex: "female",
        role: "ocamler",
        collapsed: false
      }
    ]
  },
  {
    type: "CEO",
    collapsed: false,
    people: [
      {
        name: "Drew Anderson",
        age: 39,
        sex: "male",
        role: "boss",
        collapsed: false
      }
    ]
  }
];

// For the sake of simplicity, we're gonna use `defaultCollapsed`. Usually, a
// [controlled component](http://facebook.github.io/react/docs/forms.html#controlled-components)
// is preferred.
class VersionControl extends React.Component {
  render() {
    return (
      <div>
        {dataSource.map((node, i) => {
          const type = node.type;
          const label = <span className="node">{type}</span>;
          return (
            <TreeView
              key={type + "|" + i}
              nodeLabel={label}
              defaultCollapsed={false}
            >
              {node.people.map(person => {
                const label2 = <span className="node">{person.name}</span>;
                return (
                  <TreeView
                    nodeLabel={label2}
                    key={person.name}
                    defaultCollapsed={false}
                  >
                    <div className="info">age: {person.age}</div>
                    <div className="info">sex: {person.sex}</div>
                    <div className="info">role: {person.role}</div>
                  </TreeView>
                );
              })}
            </TreeView>
          );
        })}
      </div>
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

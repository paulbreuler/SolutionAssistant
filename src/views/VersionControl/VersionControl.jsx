import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { addNotification, removeNotification } from "../../redux";

class VersionControl extends React.Component {
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
    return <p> hello </p>;
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

export default connect(
  mapStateToProps,
  mapActionsToProps
)(VersionControl);

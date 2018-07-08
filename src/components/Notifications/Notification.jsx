import React from "react";
import { withStyles, Snackbar, IconButton } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import PropTypes from "prop-types";
import cx from "classnames";

import notificationContentStyle from "../../assets/jss/material-dashboard-react/notificationContentStyle.jsx";

class Notification extends React.Component {
  closeSnackbar() {
    this.props.closeNotification(this.props.id);
  }

  render() {
    const {
      classes,
      message,
      color,
      close,
      icon,
      place,
      open,
      id
    } = this.props;
    var action = [];
    const messageClasses = cx({
      [classes.iconMessage]: icon !== undefined
    });
    if (close !== undefined) {
      action = [
        <IconButton
          className={classes.iconButton}
          key="close"
          aria-label="Close"
          color="inherit"
        >
          <Close
            className={classes.close}
            onClick={this.closeSnackbar.bind(this)}
          />
        </IconButton>
      ];
    }
    return (
      <Snackbar
        key={id}
        anchorOrigin={{
          vertical: place.indexOf("t") === -1 ? "bottom" : "top",
          horizontal:
            place.indexOf("l") !== -1
              ? "left"
              : place.indexOf("c") !== -1
                ? "center"
                : "right"
        }}
        open={open}
        message={
          <div>
            {icon !== undefined ? (
              <this.props.icon className={classes.icon} />
            ) : null}
            <span className={messageClasses}>{message}</span>
          </div>
        }
        action={action}
        classes={{ root: classes.overridePositionFix }}
        ContentProps={{
          classes: {
            root: classes.root + " " + classes[color],
            message: classes.message
          }
        }}
      />
    );
  }
}

Notification.propTypes = {
  classes: PropTypes.object.isRequired,
  message: PropTypes.node.isRequired,
  color: PropTypes.oneOf([
    "",
    "info",
    "success",
    "warning",
    "danger",
    "primary"
  ]),
  close: PropTypes.bool,
  icon: PropTypes.func,
  place: PropTypes.oneOf(["tl", "tr", "tc", "br", "bl", "bc"]),
  open: PropTypes.bool,
  closeNotification: PropTypes.func
};

export default withStyles(notificationContentStyle)(Notification);

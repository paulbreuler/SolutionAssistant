import React from "react";
import Badge from "@material-ui/core/Badge";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import NotificationsIcon from "@material-ui/icons/Notifications";

import {
  grayColor,
  roseColor,
  primaryColor,
  infoColor,
  successColor,
  warningColor,
  dangerColor
} from "assets/jss/material-dashboard-react.jsx";

const StyledBadge = withStyles(theme => ({
  badge: {
    backgroundColor: dangerColor
  }
}))(Badge);

export default function NotificationButton({ ...props }) {
  const { badgeContent, ...rest } = props;
  return (
    <IconButton {...rest} color="inherit" aria-label="Notifications">
      {badgeContent > 0 ? (
        <StyledBadge badgeContent={badgeContent} color="secondary">
          <NotificationsIcon />
        </StyledBadge>
      ) : (
        <NotificationsIcon />
      )}
    </IconButton>
  );
}

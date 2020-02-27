import React from "react";
import Badge from "@material-ui/core/Badge";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import NotificationsIcon from "@material-ui/icons/Notifications";

import { dangerColor } from "assets/jss/material-dashboard-react.jsx";

const StyledBadge = withStyles(theme => ({
  badge: {
    backgroundColor: dangerColor
  }
}))(Badge);

export default function NotificationButton({ ...props }) {
  const { badgeContent, ...buttonOptions } = props;
  return (
    <React.Fragment>
      {badgeContent > 0 ? (
        <IconButton
          {...buttonOptions}
          color="inherit"
          aria-label="Notifications"
        >
          <StyledBadge badgeContent={badgeContent} color="secondary">
            <NotificationsIcon />
          </StyledBadge>
        </IconButton>
      ) : null}
    </React.Fragment>
  );
}

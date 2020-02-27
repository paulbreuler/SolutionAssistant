import React from "react";
import Notification from "./Notification.jsx";
import { connect } from "react-redux";
import { addNotification, removeNotification } from "../../redux";
import { Badge, IconButton } from "@material-ui/core";
import NotificationButton from "./NotificationButton";

class NotificationManager extends React.Component {
  constructor(props) {
    super(props);
    this.closeNotification = this.closeNotification.bind(this);
    this.state = {
      showNotifications: true,
      timeoutRequest: Array()
    };
    this.updateState = this.updateState.bind(this);
  }

  updateState() {
    this.setState({ showNotifications: !this.state.showNotifications });
  }

  componentDidMount() {}

  closeNotification(id) {
    this.props.onRemoveNotification(id);
  }

  render() {
    const { maxNotificationToDisplay, displayDuration } = this.props;

    // Set default to 30 seconds. TODO implement better notification timeouts
    let duration = displayDuration ? displayDuration : 10000;

    return (
      <React.Fragment>
        {this.props.notifications.length > 0 && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              right: 15,
              justifyContent: "flex-end"
            }}
          >
            {this.props.notifications
              .slice(
                0,
                maxNotificationToDisplay ? maxNotificationToDisplay : Infinity
              )
              .map(notification => {
                return (
                  <React.Fragment>
                    {this.state.showNotifications ? (
                      <Notification
                        key={notification.id}
                        id={notification.id}
                        place="br"
                        color={notification.color}
                        icon={notification.icon}
                        message={notification.message}
                        open={notification.open}
                        closeNotification={this.closeNotification}
                        close
                      />
                    ) : null}
                  </React.Fragment>
                );
              })}
          </div>
        )}

        <NotificationButton
          badgeContent={this.props.notifications.length}
          onClick={this.updateState}
        ></NotificationButton>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  notifications: state.notifications
});

const mapActionsToProps = {
  onAddNotification: addNotification,
  onRemoveNotification: removeNotification
};

export default connect(mapStateToProps, mapActionsToProps)(NotificationManager);

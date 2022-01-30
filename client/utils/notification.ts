import { notification } from "antd";

export interface NotificationOpts {
  message: string;
  description: string;
}

export const showNotification = ({
  message,
  description,
}: NotificationOpts) => {
  return notification.info({
    message,
    description,
    onClick: () => {
      console.log("Notification Clicked!");
    },
  });
};

export const showErrorNotification = ({
  message,
  description,
}: NotificationOpts) => {
  return notification.error({
    message,
    description,
    onClick: () => {
      console.log("Notification Clicked!");
    },
  });
};

export const showSuccessNotification = ({
  message,
  description,
}: NotificationOpts) => {
  return notification.success({
    message,
    description,
    onClick: () => {
      console.log("Notification Clicked!");
    },
  });
};

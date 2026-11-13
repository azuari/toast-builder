import type { ToastOptions, ToastType } from "./types";

export const TYPE_COLORS: Record<ToastType, { title: string; backgroundColor: string; textColor: string; icon: string }> = {
  success: {
    title: "Success",
    backgroundColor: "#22c55e",
    textColor: "#ffffff",
    icon: "CircleCheck",
  },
  error: {
    title: "Error",
    backgroundColor: "#ef4444",
    textColor: "#ffffff",
    icon: "CircleX",
  },
  warning: {
    title: "Warning",
    backgroundColor: "#f59e0b",
    textColor: "#ffffff",
    icon: "TriangleAlert",
  },
  info: {
    title: "Info",
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
    icon: "Info",
  },
};

export const DEFAULT_TOAST_OPTIONS: ToastOptions = {
  type: "info",
  title: "Info",
  message: "",
  duration: 3000,
  persistent: false,
  position: "top-right",
  backgroundColor: "#3b82f6",
  textColor: "#ffffff",
  showIcon: true,
  showCloseButton: true,
  animation: "fade",
};

export const DEFAULT_OPTIONS_BY_TYPE: Record<ToastType, ToastOptions> = {
  success: {
    ...DEFAULT_TOAST_OPTIONS,
    type: "success",
    title: TYPE_COLORS.success.title,
    backgroundColor: TYPE_COLORS.success.backgroundColor,
    textColor: TYPE_COLORS.success.textColor,
    showIcon: true,
  },
  error: {
    ...DEFAULT_TOAST_OPTIONS,
    type: "error",
    title: TYPE_COLORS.error.title,
    backgroundColor: TYPE_COLORS.error.backgroundColor,
    textColor: TYPE_COLORS.error.textColor,
    showIcon: true,
  },
  warning: {
    ...DEFAULT_TOAST_OPTIONS,
    type: "warning",
    title: TYPE_COLORS.warning.title,
    backgroundColor: TYPE_COLORS.warning.backgroundColor,
    textColor: TYPE_COLORS.warning.textColor,
    showIcon: true,
  },
  info: {
    ...DEFAULT_TOAST_OPTIONS,
    type: "info",
    title: TYPE_COLORS.info.title,
    backgroundColor: TYPE_COLORS.info.backgroundColor,
    textColor: TYPE_COLORS.info.textColor,
    showIcon: true,
  },
};

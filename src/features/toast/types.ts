export type ToastType = "success" | "error" | "warning" | "info";
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
export type ToastAnimation = "fade" | "slide" | "bounce";

export interface ToastOptions {
  type: ToastType;
  title: string;
  message: string;
  duration: number;
  persistent: boolean;
  position: ToastPosition;
  backgroundColor: string;
  textColor: string;
  showIcon: boolean;
  showCloseButton: boolean;
  animation: ToastAnimation;
}

export interface Preset {
  id: string;
  name: string;
  options: ToastOptions;
  createdAt: string;
}

export interface ToastItem extends ToastOptions {
  id: string;
  createdAt: number;
  remaining: number;
  paused: boolean;
  status: "visible" | "exiting";
  lastUpdatedAt: number;
}

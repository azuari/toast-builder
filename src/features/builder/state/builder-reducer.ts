import { DEFAULT_OPTIONS_BY_TYPE } from "@/features/toast/constants";
import type {
  ToastAnimation,
  ToastOptions,
  ToastPosition,
  ToastType,
} from "@/features/toast/types";

export interface BuilderCustomised {
  title: boolean;
  backgroundColor: boolean;
  textColor: boolean;
  showIcon: boolean;
}

export interface BuilderState {
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
  customised: BuilderCustomised;
}

export type BuilderAction =
  | { type: "SET_TYPE"; value: ToastType }
  | { type: "UPDATE_TITLE"; value: string }
  | { type: "UPDATE_MESSAGE"; value: string }
  | { type: "UPDATE_DURATION"; value: number }
  | { type: "SET_PERSISTENT"; value: boolean }
  | { type: "SET_POSITION"; value: ToastPosition }
  | { type: "UPDATE_BACKGROUND_COLOR"; value: string }
  | { type: "UPDATE_TEXT_COLOR"; value: string }
  | { type: "SET_SHOW_ICON"; value: boolean }
  | { type: "SET_SHOW_CLOSE_BUTTON"; value: boolean }
  | { type: "SET_ANIMATION"; value: ToastAnimation }
  | { type: "RESET" };

export const getInitialBuilderState = (type: ToastType = "success"): BuilderState => {
  const defaults = DEFAULT_OPTIONS_BY_TYPE[type];

  return {
    type,
    title: defaults.title,
    message: defaults.message,
    duration: defaults.duration,
    persistent: defaults.persistent,
    position: defaults.position,
    backgroundColor: defaults.backgroundColor,
    textColor: defaults.textColor,
    showIcon: defaults.showIcon,
    showCloseButton: defaults.showCloseButton,
    animation: defaults.animation,
    customised: {
      title: false,
      backgroundColor: false,
      textColor: false,
      showIcon: false,
    },
  };
};

export const builderReducer = (
  state: BuilderState,
  action: BuilderAction,
): BuilderState => {
  switch (action.type) {
    case "SET_TYPE": {
      const defaults = DEFAULT_OPTIONS_BY_TYPE[action.value];
      return {
        ...state,
        type: action.value,
        title: state.customised.title ? state.title : defaults.title,
        backgroundColor: state.customised.backgroundColor ? state.backgroundColor : defaults.backgroundColor,
        textColor: state.customised.textColor ? state.textColor : defaults.textColor,
        showIcon: state.customised.showIcon ? state.showIcon : defaults.showIcon,
        message: state.message,
      };
    }
    case "UPDATE_TITLE": {
      return {
        ...state,
        title: action.value.slice(0, 60),
        customised: { ...state.customised, title: true },
      };
    }
    case "UPDATE_MESSAGE": {
      return {
        ...state,
        message: action.value.slice(0, 200),
      };
    }
    case "UPDATE_DURATION": {
      return {
        ...state,
        duration: action.value,
      };
    }
    case "SET_PERSISTENT": {
      return {
        ...state,
        persistent: action.value,
      };
    }
    case "SET_POSITION": {
      return {
        ...state,
        position: action.value,
      };
    }
    case "UPDATE_BACKGROUND_COLOR": {
      return {
        ...state,
        backgroundColor: action.value,
        customised: { ...state.customised, backgroundColor: true },
      };
    }
    case "UPDATE_TEXT_COLOR": {
      return {
        ...state,
        textColor: action.value,
        customised: { ...state.customised, textColor: true },
      };
    }
    case "SET_SHOW_ICON": {
      return {
        ...state,
        showIcon: action.value,
        customised: { ...state.customised, showIcon: true },
      };
    }
    case "SET_SHOW_CLOSE_BUTTON": {
      return {
        ...state,
        showCloseButton: action.value,
      };
    }
    case "SET_ANIMATION": {
      return {
        ...state,
        animation: action.value,
      };
    }
    case "RESET": {
      return getInitialBuilderState(state.type);
    }
    default:
      return state;
  }
};

export const toToastOptions = (state: BuilderState): ToastOptions => ({
  type: state.type,
  title: state.title,
  message: state.message,
  duration: state.duration * 1000,
  persistent: state.persistent,
  position: state.position,
  backgroundColor: state.backgroundColor,
  textColor: state.textColor,
  showIcon: state.showIcon,
  showCloseButton: state.showCloseButton,
  animation: state.animation,
});

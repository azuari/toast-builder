import { DEFAULT_OPTIONS_BY_TYPE } from "@/features/toast/constants";
import type {
  ToastAnimation,
  ToastOptions,
  ToastPosition,
  ToastType,
} from "@/features/toast/types";

export const BUILDER_DEFAULT_TITLE = "Success!";
export const BUILDER_DEFAULT_MESSAGE = "Your changes have been saved successfully.";
export const BUILDER_DEFAULT_DURATION_SECONDS = 3;

export interface BuilderState {
  type: ToastType;
  title: string;
  message: string;
  /** Slider value in seconds. Kept while `persistent` is on so unchecking restores it. */
  duration: number;
  persistent: boolean;
  position: ToastPosition;
  backgroundColor: string;
  textColor: string;
  showIcon: boolean;
  showCloseButton: boolean;
  animation: ToastAnimation;
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
  | { type: "LOAD"; options: ToastOptions }
  | { type: "RESET" };

export const getInitialBuilderState = (type: ToastType = "success"): BuilderState => {
  const defaults = DEFAULT_OPTIONS_BY_TYPE[type];

  return {
    type,
    title: BUILDER_DEFAULT_TITLE,
    message: BUILDER_DEFAULT_MESSAGE,
    duration: BUILDER_DEFAULT_DURATION_SECONDS,
    persistent: defaults.persistent,
    position: defaults.position,
    backgroundColor: defaults.backgroundColor,
    textColor: defaults.textColor,
    showIcon: defaults.showIcon,
    showCloseButton: defaults.showCloseButton,
    animation: defaults.animation,
  };
};

export const builderReducer = (
  state: BuilderState,
  action: BuilderAction,
): BuilderState => {
  switch (action.type) {
    case "SET_TYPE": {
      // The type drives the colour only; the title and message are the user's own text.
      return {
        ...state,
        type: action.value,
        backgroundColor: DEFAULT_OPTIONS_BY_TYPE[action.value].backgroundColor,
      };
    }
    case "UPDATE_TITLE": {
      return { ...state, title: action.value.slice(0, 60) };
    }
    case "UPDATE_MESSAGE": {
      return { ...state, message: action.value.slice(0, 200) };
    }
    case "UPDATE_DURATION": {
      return { ...state, duration: action.value };
    }
    case "SET_PERSISTENT": {
      return { ...state, persistent: action.value };
    }
    case "SET_POSITION": {
      return { ...state, position: action.value };
    }
    case "UPDATE_BACKGROUND_COLOR": {
      return { ...state, backgroundColor: action.value };
    }
    case "UPDATE_TEXT_COLOR": {
      return { ...state, textColor: action.value };
    }
    case "SET_SHOW_ICON": {
      return { ...state, showIcon: action.value };
    }
    case "SET_SHOW_CLOSE_BUTTON": {
      return { ...state, showCloseButton: action.value };
    }
    case "SET_ANIMATION": {
      return { ...state, animation: action.value };
    }
    case "LOAD": {
      const { options } = action;
      return {
        type: options.type,
        title: options.title,
        message: options.message,
        // A persistent preset is stored with duration 0; keep the current slider value for when it is unchecked.
        duration: options.duration > 0 ? options.duration / 1000 : state.duration,
        persistent: options.persistent,
        position: options.position,
        backgroundColor: options.backgroundColor,
        textColor: options.textColor,
        showIcon: options.showIcon,
        showCloseButton: options.showCloseButton,
        animation: options.animation,
      };
    }
    case "RESET": {
      return getInitialBuilderState("success");
    }
    default:
      return state;
  }
};

export const toToastOptions = (state: BuilderState): ToastOptions => ({
  type: state.type,
  title: state.title,
  message: state.message,
  duration: state.persistent ? 0 : state.duration * 1000,
  persistent: state.persistent,
  position: state.position,
  backgroundColor: state.backgroundColor,
  textColor: state.textColor,
  showIcon: state.showIcon,
  showCloseButton: state.showCloseButton,
  animation: state.animation,
});

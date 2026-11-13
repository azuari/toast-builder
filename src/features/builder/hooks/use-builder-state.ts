"use client";

import { useReducer } from "react";

import { builderReducer, getInitialBuilderState, type BuilderAction, type BuilderState } from "@/features/builder/state/builder-reducer";

export function useBuilderState() {
  return useReducer(builderReducer, getInitialBuilderState("success")) as [
    BuilderState,
    React.Dispatch<BuilderAction>,
  ];
}

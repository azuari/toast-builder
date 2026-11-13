import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BuilderPage } from "@/features/builder/components/builder-page";
import { ToastProvider } from "@/features/toast/provider";
import { Toaster } from "@/features/toast/toaster";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function renderBuilder() {
  return render(
    <ToastProvider>
      <BuilderPage />
      <Toaster />
    </ToastProvider>,
  );
}

const getStage = () => screen.getByRole("region", { name: /notification preview/i });
const getShowButton = () => screen.getByRole("button", { name: /show notification/i });
const getTitleInput = () => screen.getByLabelText(/^title/i) as HTMLInputElement;
// The colour picker and the hex text box share a value, so target the text box by id.
const getBackgroundHex = () => document.getElementById("background-color-hex") as HTMLInputElement;

afterEach(() => {
  vi.useRealTimers();
});

describe("BuilderPage", () => {
  it("keeps the Preview stage empty until a notification is shown", () => {
    renderBuilder();

    expect(within(getStage()).queryByRole("status")).not.toBeInTheDocument();
    expect(within(getStage()).queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders a toast inside the Preview stage, not at the viewport edge", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(getShowButton());

    const toast = within(getStage()).getByRole("status");
    expect(toast).toHaveTextContent("Success!");
    expect(toast).toHaveTextContent("Your changes have been saved successfully.");
    // Only the preview's own toast exists; nothing was added to the page-level Toaster.
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it.each([
    ["Top Left", "left-4", "top-4"],
    ["Top Center", "left-1/2", "top-4"],
    ["Top Right", "right-4", "top-4"],
    ["Bottom Left", "left-4", "bottom-4"],
    ["Bottom Center", "left-1/2", "bottom-4"],
    ["Bottom Right", "right-4", "bottom-4"],
  ])("places the toast at %s of the stage", async (label, horizontal, vertical) => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole("button", { name: new RegExp(`^${label}$`, "i") }));
    await user.click(getShowButton());

    const stack = within(getStage()).getByRole("status").parentElement;
    expect(stack).toHaveClass(horizontal, vertical, "absolute");
  });

  it("stacks repeated toasts with the newest nearest the anchored edge", async () => {
    const user = userEvent.setup();
    renderBuilder();

    // Top: newest first.
    await user.click(screen.getByRole("button", { name: /^top left$/i }));
    await user.click(getShowButton());
    await user.clear(getTitleInput());
    await user.type(getTitleInput(), "Second");
    await user.click(getShowButton());

    let toasts = within(getStage()).getAllByRole("status");
    expect(toasts).toHaveLength(2);
    expect(toasts[0]).toHaveTextContent("Second");
    expect(toasts[1]).toHaveTextContent("Success!");

    // Bottom: newest last (closest to the bottom edge).
    await user.click(screen.getByRole("button", { name: /^bottom left$/i }));
    await user.click(getShowButton());

    toasts = within(getStage()).getAllByRole("status");
    const bottomStack = toasts.find((toast) => toast.parentElement?.classList.contains("bottom-4"))?.parentElement;
    expect(bottomStack).toBeDefined();
    expect(within(bottomStack as HTMLElement).getAllByRole("status")).toHaveLength(1);
  });

  it("auto-dismisses a toast after its duration", () => {
    vi.useFakeTimers();
    renderBuilder();

    fireEvent.click(getShowButton());
    const toast = within(getStage()).getByRole("status");
    expect(toast).not.toHaveClass("animate-toast-fade-out");

    act(() => {
      vi.advanceTimersByTime(2900);
    });
    expect(toast).not.toHaveClass("animate-toast-fade-out");

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(toast).toHaveClass("animate-toast-fade-out");

    fireEvent.animationEnd(toast);
    expect(within(getStage()).queryByRole("status")).not.toBeInTheDocument();
  });

  it("never auto-dismisses a persistent toast", () => {
    vi.useFakeTimers();
    renderBuilder();

    fireEvent.click(screen.getByLabelText(/persistent/i));
    fireEvent.click(getShowButton());

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(within(getStage()).getByRole("status")).not.toHaveClass("animate-toast-fade-out");
  });

  it("shows 0s and disables the slider when Persistent is checked, then restores the value", async () => {
    const user = userEvent.setup();
    renderBuilder();

    const slider = screen.getByRole("slider", { name: /duration in seconds/i });
    fireEvent.change(slider, { target: { value: "5" } });
    expect(screen.getByTestId("duration-value")).toHaveTextContent("5s");
    expect(slider).toBeEnabled();

    await user.click(screen.getByLabelText(/persistent/i));
    expect(screen.getByTestId("duration-value")).toHaveTextContent("0s");
    expect(slider).toBeDisabled();
    expect(screen.getByText(/"duration": 0,/)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/persistent/i));
    expect(screen.getByTestId("duration-value")).toHaveTextContent("5s");
    expect(slider).toBeEnabled();
    expect(screen.getByText(/"duration": 5000,/)).toBeInTheDocument();
  });

  it("keeps the title when the type changes, and updates the colour", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.clear(getTitleInput());
    await user.type(getTitleInput(), "Saved your work");

    await user.click(screen.getByRole("button", { name: /^error$/i }));

    expect(getTitleInput()).toHaveValue("Saved your work");
    expect(getBackgroundHex()).toHaveValue("#ef4444");

    await user.click(getShowButton());
    const toast = within(getStage()).getByRole("alert");
    expect(toast).toHaveTextContent("Saved your work");
    expect(toast).toHaveStyle({ backgroundColor: "#ef4444" });
  });

  it("does not show a notification while a colour is invalid", async () => {
    const user = userEvent.setup();
    renderBuilder();

    const background = getBackgroundHex();
    await user.clear(background);
    await user.type(background, "#12");
    await user.click(getShowButton());

    expect(within(getStage()).queryByRole("status")).not.toBeInTheDocument();
  });

  it("hides the icon and close button when they are switched off", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByLabelText(/show close button/i));
    await user.click(getShowButton());

    expect(screen.queryByRole("button", { name: /dismiss notification/i })).not.toBeInTheDocument();
  });

  it("dismisses a toast with the close button", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(getShowButton());
    await user.click(screen.getByRole("button", { name: /dismiss notification/i }));
    fireEvent.animationEnd(screen.getByRole("status"));

    await waitFor(() => {
      expect(within(getStage()).queryByRole("status")).not.toBeInTheDocument();
    });
  });

  it("switches the copy button to Copied! for two seconds", async () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    renderBuilder();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /copy to clipboard/i }));
    });
    expect(screen.getByRole("button", { name: /copied!/i })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("button", { name: /copy to clipboard/i })).toBeInTheDocument();
  });

  it("saves, loads and deletes a preset", async () => {
    const user = userEvent.setup();
    localStorage.clear();
    renderBuilder();

    await user.click(screen.getByRole("button", { name: /^warning$/i }));
    const input = screen.getByPlaceholderText(/preset name/i);
    await user.type(input, "Test preset");
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(screen.getByText("Test preset")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^info$/i }));
    expect(getBackgroundHex()).toHaveValue("#3b82f6");

    await user.click(screen.getByRole("button", { name: /load test preset/i }));
    expect(getBackgroundHex()).toHaveValue("#f59e0b");

    await user.click(screen.getByRole("button", { name: /delete test preset/i }));
    await waitFor(() => {
      expect(screen.queryByText("Test preset")).not.toBeInTheDocument();
    });
  });
});

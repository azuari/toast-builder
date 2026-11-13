import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

describe("BuilderPage", () => {
  it("renders a toast when Show Notification is clicked", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole("button", { name: /show notification/i }));

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("dismisses a toast with the close button", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole("button", { name: /show notification/i }));
    await user.click(screen.getByRole("button", { name: /dismiss notification/i }));
    fireEvent.animationEnd(screen.getByRole("status"));

    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  it("saves and deletes a preset", async () => {
    const user = userEvent.setup();
    localStorage.clear();
    renderBuilder();

    const input = screen.getByPlaceholderText(/preset name/i);
    await user.clear(input);
    await user.type(input, "Test preset");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(screen.getByText("Test preset")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /delete test preset/i }));
    await waitFor(() => {
      expect(screen.queryByText("Test preset")).not.toBeInTheDocument();
    });
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { Label } from "@/components/ui/label";

describe("Label", () => {
  test("forbinder label med input via htmlFor og kan klikkes", async () => {
    render(
      <div>
        <Label htmlFor="navn">Navn</Label>
        <input id="navn" />
      </div>
    );

    const input = screen.getByLabelText("Navn");
    expect(input).toBeInTheDocument();

    await userEvent.click(screen.getByText("Navn"));
    expect(input).toHaveFocus();
  });

  test("tilføjer data-slot og merger className", () => {
    render(<Label className="text-red-500">Felt</Label>);
    const lab = screen.getByText("Felt");
    expect(lab).toHaveAttribute("data-slot", "label");
    expect(lab).toHaveClass("text-red-500");
    expect(lab.className).toMatch(/text-sm/);
    expect(lab.className).toMatch(/font-medium/);
  });
});

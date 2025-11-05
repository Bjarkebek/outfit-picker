import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

function DemoSelect() {
  return (
    <div>
      <Label htmlFor="category">Category</Label>
      <Select>
        <SelectTrigger id="category" aria-label="Category">
          <SelectValue placeholder="Choose category" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Overdele</SelectLabel>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="bottom">Bottom</SelectItem>
            <SelectSeparator />
            <SelectItem value="shoes">Shoes</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

describe("Select", () => {
  test("opens via trigger and chooses an option", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<DemoSelect />);

    const trigger = screen.getByRole("combobox", { name: /category/i });
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);

    const option = await screen.findByRole("option", { name: /^top$/i });
    await user.click(option);

    // Tjek triggerens viste værdi
    expect(trigger).toHaveTextContent(/top/i);
    // (valgfrit) dropdown lukket igen
    expect(trigger).toHaveAttribute("data-state", "closed");
  });

  test("can open with keyboard and choose first element", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<DemoSelect />);

    const trigger = screen.getByRole("combobox", { name: /category/i });
    await user.click(trigger);

    // Vent på at listbox er i DOM før tastetryk
    await screen.findByRole("listbox");

    // Vælg første option via tastatur
    await user.keyboard("{Home}{Enter}");
    // Alternativt: await user.keyboard("{ArrowDown}{Enter}");

    // Tjek at værdien i triggeren er opdateret
    expect(trigger).toHaveTextContent(/top/i);
    expect(trigger).toHaveAttribute("data-state", "closed");
  });
});

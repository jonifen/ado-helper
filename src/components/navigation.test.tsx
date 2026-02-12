// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { Navigation } from "./navigation.js";
import { describe, it, expect, vi } from "vitest";

vi.mock("react-router-dom", () => ({
  NavLink: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

describe("Navigation", () => {
  it("renders navigation element by id", () => {
    const { getByTestId } = render(<Navigation />);
    expect(getByTestId("navigation")).toBeTruthy();
  });
});

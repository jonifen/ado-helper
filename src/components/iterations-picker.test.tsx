// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { IterationsPicker } from "./iterations-picker.js";
import { describe, it, expect, vi } from "vitest";

vi.mock("react-router-dom", () => ({
  NavLink: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

const sampleIterations = [
  { id: "1", path: "Root\\Sprint 1", name: "Sprint 1", url: "", attributes: { startDate: new Date().toISOString(), finishDate: new Date().toISOString(), timeFrame: "" } },
];

describe("IterationsPicker", () => {
  it("renders without crashing", () => {
    render(<IterationsPicker teamId="team-1" iterations={sampleIterations} />);
    expect(document.body).toBeTruthy();
  });
});
